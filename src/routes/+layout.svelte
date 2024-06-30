<script>
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/client/components/ui/sonner';

	let { children } = $props();
</script>

<ModeWatcher />
<Toaster />
{@render children()}
