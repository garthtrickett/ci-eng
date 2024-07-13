<script lang="ts">
	import { Button } from '$lib/client/components/ui/button/';
	import * as Card from '$lib/client/components/ui/card/';
	import { Input } from '$lib/client/components/ui/input/';
	import { Label } from '$lib/client/components/ui/label/';
	import { superForm } from 'sveltekit-superforms';
	import * as Form from '$lib/client/components/ui/form';
	import { zodClient } from 'sveltekit-superforms/adapters';

	import { signInUsernameDto } from '$lib/dtos/signin-username.dto';

	import PinInput from '$lib/client/components/pin-input.svelte';
	import { page } from '$app/stores';

	const { data } = $props();

	const clientId = $page.url.searchParams.get('client_id');
	const redirect_uri = $page.url.searchParams.get('redirect_uri');
	const responseType = $page.url.searchParams.get('response_type');
	const scope = $page.url.searchParams.get('scope');
	const oidcState = $page.url.searchParams.get('state');

	// TODO:
	// need to check the format of usernames in YSP (what if there are users with same first and last name but different companies)
	// Need to change this form to submit a username and password and then change the lucia that authenticates the user

	// return c.redirect(`${redirectUri}?code=${code}&state=${state}`);

	const usernameSignInForm = superForm(data.usernameSignInForm, {
		validators: zodClient(signInUsernameDto),
		resetForm: false,
		onUpdated: ({ form }) => {
			if (form.valid) {
				$usernameSignInFormData.username = form.data.username;
				$usernameSignInFormData.username = form.data.password;
			}
		}
	});

	const { form: usernameSignInFormData, enhance: usernameSignInEnhance } = usernameSignInForm;
</script>

<Card.Root class="mx-auto mt-24 max-w-sm">
	<Card.Header>
		<Card.Title class="text-2xl">Login</Card.Title>
		<Card.Description
			>Enter your username and password below to login to your account</Card.Description
		>
	</Card.Header>
	<Card.Content>
		<div class="grid gap-4">
			{@render usernameForm()}
			<!-- <Button variant="outline" class="w-full">Login with Discord</Button> -->
		</div>
		<div class="mt-4 text-center text-sm">
			By registering, you agree to our <a href="##" class="underline">Terms of Service</a>
		</div>
	</Card.Content>
</Card.Root>

{#snippet usernameForm()}
	<form method="POST" action="?/signin" use:usernameSignInEnhance class="grid gap-4">
		<Form.Field form={usernameSignInForm} name="username">
			<Form.Control let:attrs>
				<Form.Label>Username</Form.Label>
				<Input
					{...attrs}
					type="username"
					placeholder="don.ridges"
					bind:value={$usernameSignInFormData.username}
				/>

				<Form.Label>Password</Form.Label>
				<Input
					{...attrs}
					type="password"
					placeholder="super-safe-password"
					bind:value={$usernameSignInFormData.password}
				/>
			</Form.Control>
			<Form.Description />
			<Form.FieldErrors />
		</Form.Field>
		<Button type="submit" class="w-full">Sign In</Button>
	</form>
{/snippet}
