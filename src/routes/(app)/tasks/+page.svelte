<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';

	import { rpc } from '$lib/client/helpers/api';

	async function fetchTodos() {
		const res = await rpc.api.tasks.$get();
		const data = await res.json();
		console.log(data);

		// Dummy todos
		const todos = [
			{ id: 1, title: 'Todo 1' },
			{ id: 2, title: 'Todo 2' },
			{ id: 3, title: 'Todo 3' }
			// Add more todos as needed
		];

		return todos;
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
		{#each $query.data as todo}
			<p>{todo.title}</p>
		{/each}
	{/if}
</div>
