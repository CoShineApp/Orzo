<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import { formatDuration, formatBytes } from '$lib/utils';
	import { env } from '$env/dynamic/public';

	interface Clip {
		id: string;
		share_code: string;
		filename: string;
		b2_file_name: string;
		file_size: number;
		duration_seconds: number | null;
		uploaded_at: string;
		metadata: any | null;
		user_id: string | null;
		device_id: string;
	}

	let clip = $state<Clip | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	const shareCode = $derived($page.params.shareCode?.toUpperCase() || '');
	const videoUrl = $derived(
		clip && shareCode
			? `${env.PUBLIC_CLIPS_CDN_URL || 'https://peppi-clips-cdn.peppiapp.workers.dev'}/${shareCode}/${clip.filename}`
			: null
	);

	onMount(async () => {
		if (!shareCode || shareCode.length !== 8 || !/^[A-Z0-9]{8}$/.test(shareCode)) {
			error = 'Invalid share code. Share codes must be exactly 8 alphanumeric characters.';
			loading = false;
			return;
		}

		// Check if Supabase is configured
		if (!env.PUBLIC_SUPABASE_URL) {
			error = 'Supabase is not configured. Please set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY environment variables.';
			loading = false;
			return;
		}

		try {
			const { data, error: fetchError } = await supabase
				.from('clips')
				.select('*')
				.eq('share_code', shareCode)
				.single();

			if (fetchError) throw fetchError;
			if (!data) {
				error = 'Clip not found';
				loading = false;
				return;
			}

			clip = data;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load clip';
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>{clip ? `${clip.filename} - Clips` : 'Clip Viewer - Clips.peppi.app'}</title>
	{#if clip}
		<meta name="description" content={`View clip ${clip.share_code} - ${clip.filename}`} />
		<meta property="og:title" content={clip.filename} />
		<meta property="og:description" content={`Clip shared via Clips.peppi.app`} />
		<meta property="og:type" content="video.other" />
		{#if videoUrl}
			<meta property="og:video" content={videoUrl} />
		{/if}
	{/if}
</svelte:head>

<div class="min-h-screen bg-background text-foreground">
	{#if loading}
		<div class="flex items-center justify-center min-h-screen">
			<div class="text-center">
				<div class="text-muted-foreground text-lg mb-2">Loading clip...</div>
				<div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
			</div>
		</div>
	{:else if error}
		<div class="flex items-center justify-center min-h-screen px-4">
			<div class="text-center max-w-md">
				<div class="text-destructive text-xl font-semibold mb-2">Error</div>
				<div class="text-muted-foreground">{error}</div>
			</div>
		</div>
	{:else if clip && videoUrl}
		<div class="container mx-auto px-4 py-8 max-w-4xl">
			<!-- Video Player -->
			<div class="mb-6">
				<video
					controls
					class="w-full rounded-lg bg-card"
					preload="metadata"
					playsinline
					webkit-playsinline
					src={videoUrl}
				>
					<track kind="captions" />
					Your browser does not support the video tag.
				</video>
			</div>

			<!-- Metadata -->
			<div class="bg-card rounded-lg p-6 border border-border">
				<h1 class="text-2xl font-semibold mb-4 text-card-foreground">{clip.filename}</h1>
				
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
					<div>
						<div class="text-muted-foreground mb-1">Share Code</div>
						<div class="font-mono text-foreground">{clip.share_code}</div>
					</div>
					
					<div>
						<div class="text-muted-foreground mb-1">Uploaded</div>
						<div class="text-foreground">
							{new Date(clip.uploaded_at).toLocaleString()}
						</div>
					</div>
					
					{#if clip.duration_seconds}
						<div>
							<div class="text-muted-foreground mb-1">Duration</div>
							<div class="text-foreground">{formatDuration(clip.duration_seconds)}</div>
						</div>
					{/if}
					
					<div>
						<div class="text-muted-foreground mb-1">File Size</div>
						<div class="text-foreground">{formatBytes(clip.file_size)}</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

