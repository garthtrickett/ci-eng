<script lang="ts">
	import { Button } from '$lib/client/components/ui/button/';
	import * as Card from '$lib/client/components/ui/card/';
	import { Input } from '$lib/client/components/ui/input/';
	import { Label } from '$lib/client/components/ui/label/';
	import { superForm } from 'sveltekit-superforms';
	import * as Form from '$lib/client/components/ui/form';
	import { zodClient } from 'sveltekit-superforms/adapters';

	import { registerEmailDto } from '$lib/dtos/register-email.dto';
	import { signInEmailDto } from '$lib/dtos/signin-email.dto';
	import PinInput from '$lib/client/components/pin-input.svelte';
	import { page } from '$app/stores';

	const { data } = $props();

	const clientId = $page.url.searchParams.get('client_id');
	const redirect_uri = $page.url.searchParams.get('redirect_uri');
	const responseType = $page.url.searchParams.get('response_type');
	const scope = $page.url.searchParams.get('scope');
	const oidcState = $page.url.searchParams.get('state');

	// TODO:
	// Need to change this form to submit a username and password and then change the lucia that authenticates the user

	// return c.redirect(`${redirectUri}?code=${code}&state=${state}`);

	let showTokenVerification = $state(false);

	const emailRegisterForm = superForm(data.emailRegisterForm, {
		validators: zodClient(registerEmailDto),
		resetForm: false,
		onUpdated: ({ form }) => {
			if (form.valid) {
				showTokenVerification = true;
				$emailSigninFormData.email = form.data.email;
			}
		}
	});

	const emailSigninForm = superForm(data.emailSigninForm, {
		validators: zodClient(signInEmailDto),
		resetForm: false
	});

	const { form: emailRegisterFormData, enhance: emailRegisterEnhance } = emailRegisterForm;
	const { form: emailSigninFormData, enhance: emailSigninEnhance } = emailSigninForm;
</script>

<Card.Root class="mx-auto mt-24 max-w-sm">
	<Card.Header>
		<Card.Title class="text-2xl">Login</Card.Title>
		<Card.Description>Enter your email below to login to your account</Card.Description>
	</Card.Header>
	<Card.Content>
		<div class="grid gap-4">
			{#if showTokenVerification}
				{@render tokenForm()}
			{:else}
				{@render emailForm()}
			{/if}
			<!-- <Button variant="outline" class="w-full">Login with Discord</Button> -->
		</div>
		<div class="mt-4 text-center text-sm">
			By registering, you agree to our <a href="##" class="underline">Terms of Service</a>
		</div>
	</Card.Content>
</Card.Root>

{#snippet emailForm()}
	<form method="POST" action="?/register" use:emailRegisterEnhance class="grid gap-4">
		<Form.Field form={emailRegisterForm} name="email">
			<Form.Control let:attrs>
				<Form.Label>Email</Form.Label>
				<Input
					{...attrs}
					type="email"
					placeholder="you@awesome.com"
					bind:value={$emailRegisterFormData.email}
				/>
			</Form.Control>
			<Form.Description />
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field form={emailRegisterForm} name="password">
			<Form.Control let:attrs>
				<Form.Label>Password</Form.Label>
				<Input
					{...attrs}
					type="password"
					placeholder="Your password"
					bind:value={$emailRegisterFormData.password}
				/>
			</Form.Control>
			<Form.Description />
			<Form.FieldErrors />
		</Form.Field>
		<Button type="submit" class="w-full">Continue with Email</Button>
	</form>
{/snippet}

{#snippet tokenForm()}
	<form method="POST" action="?/signin" use:emailSigninEnhance class="space-y-4">
		<input hidden value={$emailSigninFormData.email} name="email" />
		<Form.Field form={emailSigninForm} name="token">
			<Form.Control let:attrs>
				<Form.Label />
				<PinInput class="justify-evenly" {...attrs} bind:value={$emailSigninFormData.token} />
			</Form.Control>
			<Form.Description />
			<Form.FieldErrors />
		</Form.Field>
		<Button class="w-full" type="submit">Submit</Button>
	</form>
{/snippet}
