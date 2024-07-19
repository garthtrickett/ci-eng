<script lang="ts">
	const clientId = import.meta.env.VITE_CLIENT_ID;
	const redirectUri = import.meta.env.VITE_REDIRECT_URI;
	import { onMount } from 'svelte';
	import { withClient } from '$lib/client/helpers/api';

	let state: string;
	let href: string;

	onMount(async () => {
		const data = await withClient((c) => c.api.createauthstate.$get());
		if (data && data.state) {
			state = data.state;
		}

		href = `/login?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20username&state=${state}`;
	});

	// Generate a random state
</script>

<h1>Sign in</h1>
<a {href}>Sign in with OAuth2</a>
