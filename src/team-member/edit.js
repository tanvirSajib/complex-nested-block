import { useBlockProps, RichText, MediaPlaceholder, BlockControls, MediaReplaceFlow, InspectorControls, store as blockEditorStore, } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { Spinner, withNotices, ToolbarButton, PanelBody, TextareaControl, SelectControl } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { isBlobURL, revokeBlobURL } from '@wordpress/blob';
import {select, useSelect} from "@wordpress/data";

function Edit( { attributes, setAttributes, noticeOperations,noticeUI } ) {

	const { name, bio, url, alt, id } = attributes;
	const [ blobURL, setBlobURL ] = useState();

	const imageObject = useSelect((select) => {
		const { getMedia } = select('core')
		return id ? getMedia(id) : null;
	}, [id])

	
	const imageSizes = useSelect( ( select ) => {
		return select( blockEditorStore ).getSettings().imageSizes;
	}, [] );

	

	const getImageSizeOptions = () => {
		if(!imageObject) return [];
		const options = [];
		const sizes = imageObject.media_details.sizes;
		
		for( const key in sizes ){
			const size = sizes[key];
			const imageSize  = imageSizes.find((s) => {
				return s.slug === key
			})			
			if(imageSize){
				options.push({
					label: imageSize.name,
					value: size.source_url
				})
			}
			
		}
		return options;
		
	}
	

	const onChangeName = ( newName ) => {
		setAttributes( { name: newName } );
	};
	const onChangeBio = ( newBio ) => {
		setAttributes( { bio: newBio } );
	};
    const onSelectImage = ( image ) => {
		if ( ! image || ! image.url ) {
			setAttributes( { url: undefined, id: undefined, alt: '' } );
			return;
		}
		setAttributes( { url: image.url, id: image.id, alt: image.alt } );
	};

	const onSelectURL = ( newURL ) => {
		setAttributes( {
			url: newURL,
			id: undefined,
			alt: '',
		} );
	};

	const onChangeImageSize = ( newURL ) => {
		setAttributes( { url: newURL } );
	};

	const onUploadError = ( message ) => {
		noticeOperations.removeAllNotices();
		noticeOperations.createErrorNotice( message );
	};

	const removeImage = () =>{
		setAttributes({
			url: undefined,
			alt: '',
			id: undefined
		});
	}

	const onChangeAlt = (newAlt) => {
		setAttributes({alt: newAlt});
	}

	useEffect( () => {
		if ( ! id && isBlobURL( url ) ) {
			setAttributes( {
				url: undefined,
				alt: '',
			} );
		}
	}, [] );

	useEffect( () => {
		if ( isBlobURL( url ) ) {
			setBlobURL( url );
		} else {
			revokeBlobURL( blobURL );
			setBlobURL();
		}
	}, [ url ] );


	return (
		<>
		{id && (

			<SelectControl
				label={__("Image size", 'text-domain')}
				options={ getImageSizeOptions() }
				value={ url }
				onChange={ onChangeImageSize  }
			/>
		)}
		<InspectorControls>
			<PanelBody title='Image settings'>
				{ url && ! isBlobURL(url) && (
			<TextareaControl
							label={ __( 'Alt Text', 'team-members' ) }
							value={ alt }
							onChange={ onChangeAlt }
							help={ __(
								"Alternative text describes your image to people can't see it. Add a short description with its key details.",
								'team-members'
							) }
						/>
					)}
			</PanelBody>
		</InspectorControls>
		{url && (
		<BlockControls>
			<MediaReplaceFlow 
			onSelect={ onSelectImage }
			onSelectURL={ onSelectURL }
			onError={ onUploadError }
			accept="image/*"
			allowedTypes={ [ 'image' ] }
			mediaId={id}
			mediaURL={url}	
			name="Replace Image"		
			/>

		<ToolbarButton onClick={ removeImage }>{__('Remove Image', 'text-domain')}</ToolbarButton>
		</BlockControls>
		)}
		<div { ...useBlockProps() }>

            { url && (
				<div
					className={ `wp-block-blocks-course-team-member-img${
						isBlobURL( url ) ? ' is-loading' : ''
					}` }
				>
					<img src={ url } alt={ alt } />
					{ isBlobURL( url ) && <Spinner /> }
				</div>
			) }

			<MediaPlaceholder
				icon="admin-users"
				onSelect={ onSelectImage }
				onSelectURL={ onSelectURL }
				onError={ onUploadError }
				accept="image/*"
				allowedTypes={ [ 'image' ] }
				disableMediaButtons={ url }
				notices={noticeUI}
			/>

            
			<RichText
				placeholder={ __( 'Member Name', 'team-member' ) }
				tagName="h4"
				onChange={ onChangeName }
				value={ name }
				allowedFormats={ [] }
			/>
			<RichText
				placeholder={ __( 'Member Bio', 'team-member' ) }
				tagName="p"
				onChange={ onChangeBio }
				value={ bio }
				allowedFormats={ [] }
			/>
		</div>
		</>
	);
}


export default withNotices(Edit);