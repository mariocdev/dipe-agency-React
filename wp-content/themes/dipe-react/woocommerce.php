<?php
/** Shell React y reseñas nativas: conserva permisos y envío de WordPress. */
defined('ABSPATH') || exit;
get_header();
?>
<div id="dipe-react-root"></div>
<?php if (is_product() && ! post_password_required() && have_posts()) : ?>
	<?php the_post(); ?>
	<?php global $product; $product = wc_get_product(get_the_ID()); ?>
	<?php if ($product && $product->get_reviews_allowed()) : ?>
		<div id="dipe-native-product-reviews" hidden>
			<?php
			// Quita solo el título nativo duplicado; conserva lista, formulario y contenido.
			ob_start();
			comments_template();
			$dipe_reviews_html = ob_get_clean();
			echo preg_replace( '~<h2\b[^>]*\bclass=[^>]*\bwoocommerce-Reviews-title\b[^>]*>.*?</h2>~is', '', $dipe_reviews_html );
			?>
		</div>
	<?php endif; ?>
<?php endif; ?>
<?php get_footer(); ?>
