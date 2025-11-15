<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	
	let { children } = $props();

	onMount(() => {
		// Apply dark theme to html element
		document.documentElement.classList.add('dark');
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
