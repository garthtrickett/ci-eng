<script>
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/client/components/ui/sonner';
	import { QueryClientProvider } from '@tanstack/svelte-query';

	let { data, children } = $props();

	import { queryClient } from '$lib/client/helpers/tanstack';
</script>

<svelte:head>
	<link
		rel="preload"
		href="/fonts/geist/variable-woff/GeistVF.woff2"
		as="font"
		type="font/woff2"
		crossorigin=""
	/>
</svelte:head>

<QueryClientProvider client={queryClient}>
	<main>
		<div class="font-geist">
			{@render children()}
			<ModeWatcher />
			<Toaster />
		</div>
	</main>
</QueryClientProvider>

<style></style>
