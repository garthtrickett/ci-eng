<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';

	import { withClient } from '$lib/client/helpers/api';

	withClient((c) => c.api.tasks.$put({ json: { name: 'new' } }));
	const query = createQuery({
		queryKey: ['tasksGet'],
		queryFn: () => withClient((c) => c.api.tasks.$get())
	});
</script>

<div>
	{#if $query.isLoading}
		<p>Loading...</p>
	{:else if $query.isError}
		<p>Error: {$query.error.message}</p>
	{:else if $query.isSuccess && $query.data}
		{#each $query.data as task}
			<p>{task.name}</p>
		{/each}
	{/if}
</div>
