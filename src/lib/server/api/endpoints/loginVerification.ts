import 'reflect-metadata';
import { zValidator } from '@hono/zod-validator';
import { eq, and, gte } from 'drizzle-orm';
import handlebars from 'handlebars';
import { Hono } from 'hono';
import { setCookie } from 'hono/cookie';
import { z } from 'zod';
import { BadRequest } from '../common/errors';
import { getTemplate, send } from '../common/mail';
import { validateToken } from '../common/validateToken';
import { db } from '../infrastructure/database';
import { type UpdateUser, usersTable } from '../infrastructure/database/tables/users.table'; // Import your db instance
import { takeFirst, takeFirstOrThrow } from '../infrastructure/database/utils';
import type { HonoTypes } from '../types';
import { type SendTemplate } from '../types';
import { lucia } from '../common/lucia';
import { signInEmailDto } from '$lib/dtos/signin-email.dto';
import { type SignInEmailDto } from '$lib/dtos/signin-email.dto';}
import { loginRequestsTable } from '../infrastructure/database/tables';}
import { Scrypt } from 'oslo/password';


export function loginVerification(honoController: Hono<HonoTypes>, path: string) {
  return honoController.post(path, zValidator('json', signInEmailDto), async (c) => {
    const { email, token } = c.req.valid('json');
    const session = await verify({ email, token });
    const sessionCookie = lucia.createSessionCookie(session.id);
    setCookie(c, sessionCookie.name, sessionCookie.value, {
      path: sessionCookie.attributes.path,
      maxAge: sessionCookie.attributes.maxAge,
      domain: sessionCookie.attributes.domain,
      sameSite: sessionCookie.attributes.sameSite as any,
      secure: sessionCookie.attributes.secure,
      httpOnly: sessionCookie.attributes.httpOnly,
      expires: sessionCookie.attributes.expires
    });

    return c.json({ message: 'ok' });
  });
}


async function verify(data: SignInEmailDto) {
  const validLoginRequest = await fetchValidRequest(data.email, data.token);
  if (!validLoginRequest) throw BadRequest('Invalid token');

  const existingUser = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, data.email)
  });

  if (!existingUser) {
    async function handleNewUserRegistration(data: SignInEmailDto) {
      const newUser = await db.insert(usersTable).values(data).returning().then(takeFirstOrThrow);

      function sendWelcome(data: SendTemplate<null>) {
        const template = handlebars.compile(getTemplate('welcome'));
        return send({
          to: data.to,
          subject: 'Welcome!',
          html: template(null)
        });
      }
      sendWelcome({ to: data.email, props: null });
      return newUser
    }
    const newUser = await handleNewUserRegistration(data);
    return lucia.createSession(newUser.id, {});
  }

  return lucia.createSession(existingUser.id, {});
}

async function fetchValidRequest(email: string, token: string) {
  return await db.transaction(async (trx) => {
    const loginRequest = await trx.select().from(loginRequestsTable).where(
      and(
        eq(loginRequestsTable.email, email),
        gte(loginRequestsTable.expiresAt, new Date())
      )
    ).then(takeFirst)
    if (!loginRequest) return null;


    const hasher = new Scrypt()
    const isValidRequest = hasher.verify(loginRequest.hashedToken, token);
    if (!isValidRequest) return null
    await db.delete(loginRequestsTable).where(eq(loginRequestsTable.id, loginRequest.id));
    return loginRequest
  })
}
