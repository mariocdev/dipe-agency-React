<?php
/** El formulario nativo se monta en la composición React sin regenerar su HTML. */
defined('ABSPATH') || exit;
get_header();
?>
<div id="dipe-react-root"></div>
<div id="dipe-native-commerce">
	<?php while (have_posts()) : the_post(); ?>
		<?php the_content(); ?>
	<?php endwhile; ?>
</div>
<?php get_footer(); ?>
