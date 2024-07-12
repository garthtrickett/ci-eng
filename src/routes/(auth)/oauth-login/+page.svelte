<script lang="ts">
	let clientId = '06A5FE46E6B3CDA0B06CD02BA4457A08';
	let redirectUri = 'http://localhost:5713/login';

	import { onMount } from 'svelte';
	import { withClient } from '$lib/client/helpers/api';

	let state: string;
	let href: string;

	onMount(async () => {
		const data = await withClient((c) => c.api.createauthstate.$get());
		if (data && data.state) {
			state = data.state;
		}
		href = `/login?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email&state=${state}`;
	});

	// Generate a random state
</script>

<h1>Sign in</h1>
<a {href}>Sign in with OAuth2</a>
