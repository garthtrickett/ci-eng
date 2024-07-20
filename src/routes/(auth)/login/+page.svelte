<script lang="ts">
	import { Button } from '$lib/client/components/ui/button/';
	import * as Card from '$lib/client/components/ui/card/';
	import { Input } from '$lib/client/components/ui/input/';
	import { superForm } from 'sveltekit-superforms';
	import * as Form from '$lib/client/components/ui/form';
	import { zodClient } from 'sveltekit-superforms/adapters';

	import { signInUsernameDto } from '$lib/dtos/signin-username.dto';

	import { withClient } from '$lib/client/helpers/api';
	import { page } from '$app/stores';

	const { data } = $props();

	const clientId = $page.url.searchParams.get('client_id');
	const redirectUri = $page.url.searchParams.get('redirect_uri');
	const responseType = $page.url.searchParams.get('response_type');
	const scope = $page.url.searchParams.get('scope');
	const oidcState = $page.url.searchParams.get('state');
	const nonce = $page.url.searchParams.get('nonce');

	const usernameSignInForm = superForm(data.usernameSignInForm, {
		validators: zodClient(signInUsernameDto),
		resetForm: false,
		onUpdated: ({ form }) => {
			if (form.valid) {
				const formData = {
					username: form.data.username,
					password: form.data.password,
					clientId: clientId || '',
					redirectUri: redirectUri || '',
					responseType: responseType || '',
					scope: scope || '',
					state: oidcState || '',
					nonce: nonce || ''
				};

				$usernameSignInFormData = { ...$usernameSignInFormData, ...formData };
			}
		},
		onResult: ({ result }) => {
			if (result.type === 'success' && result.data) {
				const data = result.data;
				if (data.redirectUrl) {
					window.location.href = data.redirectUrl;
				} else {
					console.error(data.error || 'An unexpected error occurred');
				}
			} else {
				console.error('An unexpected error occurred');
			}
		}
	});

	const { form: usernameSignInFormData, enhance: signInUsenameEnhance } = usernameSignInForm;
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
	<form method="POST" action="?/signin" use:signInUsenameEnhance class="grid gap-4">
		<Form.Field form={usernameSignInForm} name="username">
			<Form.Control let:attrs>
				<Form.Label>Username</Form.Label>
				<Input
					{...attrs}
					type="username"
					placeholder="don.ridges"
					bind:value={$usernameSignInFormData.username}
				/>
			</Form.Control>
			<Form.Description />
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field form={usernameSignInForm} name="password">
			<Form.Control let:attrs>
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

		<input type="hidden" name="clientId" value={clientId || ''} />
		<input type="hidden" name="redirectUri" value={redirectUri || ''} />
		<input type="hidden" name="responseType" value={responseType || ''} />
		<input type="hidden" name="scope" value={scope || ''} />
		<input type="hidden" name="state" value={oidcState || ''} />
		<input type="hidden" name="nonce" value={nonce || ''} />
		<Button type="submit" class="w-full">Sign In</Button>
	</form>
{/snippet}
