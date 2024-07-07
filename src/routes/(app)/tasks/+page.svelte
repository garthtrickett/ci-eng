<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';

	import { rpc } from '$lib/client/helpers/api';

	async function fetchTodos() {
		const res = await rpc.api.tasks.$get();
		const data = await res.json();
		console.log(data);

		return data;
	}

	const query = createQuery({
		queryKey: ['todos'],
		queryFn: () => fetchTodos()
	});
</script>

<div>
	{#if $query.isLoading}
		<p>Loading...</p>
	{:else if $query.isError}
		<p>Error: {$query.error.message}</p>
	{:else if $query.isSuccess}
		{#each $query.data as task}
			<p>{task.name}</p>
		{/each}
	{/if}
</div>
