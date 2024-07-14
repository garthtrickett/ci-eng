ALTER TABLE "users" ADD COLUMN "username" text NOT NULL;
ALTER TABLE "users" ADD COLUMN "password_hash" text NOT NULL;
ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");