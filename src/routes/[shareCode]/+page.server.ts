import { supabase } from '$lib/supabase';
import { error } from '@sveltejs/kit';
import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ params }) => {
	const shareCode = params.shareCode?.toUpperCase();

	if (!shareCode || shareCode.length !== 8 || !/^[A-Z0-9]{8}$/.test(shareCode)) {
		throw error(404, 'Invalid share code');
	}

	try {
		const { data, error: fetchError } = await supabase
			.from('clips')
			.select('*')
			.eq('share_code', shareCode)
			.single();

		if (fetchError || !data) {
			throw error(404, 'Clip not found');
		}

		return {
			clip: data
		};
	} catch (e) {
		if (e && typeof e === 'object' && 'status' in e) {
			throw e;
		}
		throw error(500, 'Failed to load clip');
	}
};

