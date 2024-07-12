<script lang="ts">
	let clientId = '06A5FE46E6B3CDA0B06CD02BA4457A08';
	let redirectUri = 'http://localhost:5713/auth-callback';

	// Function to generate a random string
	import { withClient } from '$lib/client/helpers/api';

	const state = withClient((c) => c.api.createAuthState.$get());
	// Generate a random state

	let href = `/api/oauth2?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email&state=${state}`;
</script>

<h1>Sign in</h1>
<a {href}>Sign in with OAuth2</a>
