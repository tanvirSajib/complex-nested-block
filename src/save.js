import { useBlockProps } from '@wordpress/block-editor';
export default function save() {
	return (
		<p { ...useBlockProps.save() }>
			{ 'Complex Nested Block – hello from the saved content!' }
		</p>
	);
}
