<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';

	import { fetchTasks } from './fetchTasks';

	const query = createQuery({
		queryKey: ['todos'],
		queryFn: () => fetchTasks()
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
