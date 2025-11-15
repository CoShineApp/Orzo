<script lang="ts">
	import { page } from '$app/stores';
	import { formatDuration, formatBytes } from '$lib/utils';
	import { env } from '$env/dynamic/public';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();

	const clip = $derived(data.clip);
	const shareCode = $derived($page.params.shareCode?.toUpperCase() || '');
	const videoUrl = $derived(
		clip && shareCode
			? `${env.PUBLIC_CLIPS_CDN_URL || 'https://peppi-clips-cdn.peppiapp.workers.dev'}/${shareCode}/${clip.filename}`
			: null
	);
	const pageUrl = $derived(
		shareCode ? `https://clips.peppi.app/${shareCode}` : ''
	);
</script>

<svelte:head>
	<title>{clip ? `${clip.filename} - Clips` : 'Clip Viewer - Clips.peppi.app'}</title>
	{#if clip}
		<meta name="description" content={`View clip ${clip.share_code} - ${clip.filename}`} />
		
		<!-- Open Graph / Discord -->
		<meta property="og:title" content={clip.filename} />
		<meta property="og:description" content={`Watch clip ${clip.share_code} on Clips.peppi.app`} />
		<meta property="og:type" content="video.other" />
		<meta property="og:site_name" content="Clips.peppi.app" />
		{#if pageUrl}
			<meta property="og:url" content={pageUrl} />
		{/if}
		{#if videoUrl}
			<meta property="og:video" content={videoUrl} />
			<meta property="og:video:secure_url" content={videoUrl} />
			<meta property="og:video:type" content="video/mp4" />
			<meta property="og:video:width" content="1920" />
			<meta property="og:video:height" content="1080" />
		{/if}
		<!-- Fallback image for Discord preview (you can generate a thumbnail later) -->
		<meta property="og:image" content={`https://clips.peppi.app/og-image.png`} />
		
		<!-- Twitter Card -->
		<meta name="twitter:card" content="player" />
		<meta name="twitter:title" content={clip.filename} />
		<meta name="twitter:description" content={`Watch clip ${clip.share_code}`} />
		{#if videoUrl}
			<meta name="twitter:player" content={videoUrl} />
			<meta name="twitter:player:width" content="1920" />
			<meta name="twitter:player:height" content="1080" />
		{/if}
	{:else}
		<!-- Default meta tags for loading state -->
		<meta property="og:title" content="Clips.peppi.app" />
		<meta property="og:description" content="Share and view clips from Peppi" />
		<meta property="og:type" content="website" />
	{/if}
</svelte:head>

<div class="min-h-screen bg-background text-foreground">
	{#if clip && videoUrl}
		<div class="container mx-auto px-4 py-8 max-w-4xl">
			<!-- Video Player -->
			<div class="mb-6">
				<video
					controls
					class="w-full rounded-lg bg-card"
					preload="metadata"
					playsinline
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

