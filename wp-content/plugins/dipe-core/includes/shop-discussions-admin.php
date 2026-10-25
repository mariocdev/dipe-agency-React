<?php
/** Gestión de preguntas y extensión del administrador nativo de valoraciones. */
defined( 'ABSPATH' ) || exit;

function dipe_core_shop_discussions_can_manage() {
	return current_user_can( 'manage_woocommerce' ) && current_user_can( 'edit_products' );
}

function dipe_core_shop_question_can_edit( $question ) {
	if ( ! $question || 'dipe_product_qa' !== $question->post_type || ! dipe_core_shop_discussions_can_manage() ) return false;
	return 'product' === get_post_type( $question->post_parent ) ? current_user_can( 'edit_post', $question->post_parent ) : current_user_can( 'edit_others_products' );
}

function dipe_core_shop_question_can_trash( $question ) {
	return dipe_core_shop_question_can_edit( $question ) && ( 'product' === get_post_type( $question->post_parent ) ? current_user_can( 'delete_post', $question->post_parent ) : current_user_can( 'delete_products' ) );
}

function dipe_core_shop_questions_filters( $input ) {
	$value = static function ( $key ) use ( $input ) { return isset( $input[ $key ] ) && is_scalar( $input[ $key ] ) ? sanitize_text_field( wp_unslash( (string) $input[ $key ] ) ) : ''; };
	$status = $value( 'q_status' );
	$answer = $value( 'q_answer' );
	return array(
		'q_status' => in_array( $status, array( 'publish', 'pending', 'trash' ), true ) ? $status : 'all',
		'q_answer' => in_array( $answer, array( 'answered', 'unanswered' ), true ) ? $answer : 'all',
		'product_id' => absint( $value( 'product_id' ) ), 's' => $value( 's' ),
		'order' => 'ASC' === strtoupper( $value( 'order' ) ) ? 'ASC' : 'DESC', 'orderby' => 'date',
		'paged' => max( 1, absint( $value( 'paged' ) ) ),
	);
}

function dipe_core_shop_questions_url( $filters = array() ) {
	return add_query_arg( array_merge( $filters, array( 'post_type' => 'product', 'page' => 'dipe-product-questions' ) ), admin_url( 'edit.php' ) );
}

function dipe_core_shop_questions_return_url() {
	$args = array();
	if ( isset( $_POST['return_to'] ) && is_string( $_POST['return_to'] ) ) parse_str( (string) wp_parse_url( wp_unslash( $_POST['return_to'] ), PHP_URL_QUERY ), $args );
	// Solo se recuperan filtros conocidos; nunca se reutiliza el host o la ruta recibida.
	return dipe_core_shop_questions_url( dipe_core_shop_questions_filters( wp_slash( $args ) ) );
}

function dipe_core_shop_discussions_nav( $active ) {
	$tabs = array( 'reviews' => array( 'Opiniones', add_query_arg( array( 'post_type' => 'product', 'page' => 'product-reviews' ), admin_url( 'edit.php' ) ) ), 'questions' => array( 'Preguntas y respuestas', dipe_core_shop_questions_url() ) );
	$html = '<nav class="nav-tab-wrapper dipe-discussions-nav" aria-label="Opiniones y preguntas de productos">';
	foreach ( $tabs as $key => $tab ) $html .= '<a class="nav-tab' . ( $active === $key ? ' nav-tab-active' : '' ) . '" href="' . esc_url( $tab[1] ) . '"' . ( $active === $key ? ' aria-current="page"' : '' ) . '>' . esc_html( $tab[0] ) . '</a>';
	return $html . '</nav>';
}

function dipe_core_shop_questions_menu() {
	if ( function_exists( 'WC' ) ) add_submenu_page( 'edit.php?post_type=product', 'Preguntas y respuestas', 'Preguntas y respuestas', 'manage_woocommerce', 'dipe-product-questions', 'dipe_core_shop_questions_screen' );
}
add_action( 'admin_menu', 'dipe_core_shop_questions_menu' );

function dipe_core_shop_discussions_assets() {
	$screen = get_current_screen();
	if ( ! $screen || ! in_array( $screen->id, array( 'product_page_dipe-product-questions', 'product_page_product-reviews' ), true ) ) return;
	wp_enqueue_style( 'dipe-shop-discussions', plugins_url( 'assets/shop-discussions.css', dirname( __DIR__ ) . '/dipe-core.php' ), array(), DIPE_CORE_VERSION );
	if ( 'product_page_dipe-product-questions' === $screen->id ) {
		wp_enqueue_script( 'wc-enhanced-select' );
		wp_enqueue_style( 'woocommerce_admin_styles' );
	}
}
add_action( 'admin_enqueue_scripts', 'dipe_core_shop_discussions_assets', 30 );

function dipe_core_shop_questions_screen() {
	if ( ! dipe_core_shop_discussions_can_manage() ) wp_die( 'No tienes permisos para administrar preguntas.', '', array( 'response' => 403 ) );
	$filters = dipe_core_shop_questions_filters( $_GET );
	$id = isset( $_GET['question_id'] ) && is_scalar( $_GET['question_id'] ) ? absint( $_GET['question_id'] ) : 0;
	echo '<div class="wrap dipe-shop-discussions"><h1>Opiniones y preguntas de productos</h1>' . dipe_core_shop_discussions_nav( 'questions' );
	echo '<p>Las preguntas de invitados o usuarios sin compra esperan aprobación; las de compradores identificados se publican al enviarlas, aunque aún no tengan respuesta. Puedes responderlas, publicarlas, ocultarlas o recuperarlas de la papelera.</p>';
	if ( isset( $_GET['saved'] ) ) echo '<div class="notice notice-success"><p>Pregunta y respuesta guardadas.</p></div>';
	if ( isset( $_GET['changed'] ) && is_scalar( $_GET['changed'] ) ) {
		$count = absint( $_GET['changed'] );
		$failed = isset( $_GET['failed'] ) && is_scalar( $_GET['failed'] ) ? absint( $_GET['failed'] ) : 0;
		echo '<div class="notice notice-info"><p>' . esc_html( sprintf( 'Preguntas actualizadas: %d. Sin cambios o sin permiso: %d.', $count, $failed ) ) . '</p></div>';
	}
	if ( $id ) {
		dipe_core_shop_question_editor( get_post( $id ), $filters );
		echo '</div>';
		return;
	}
	require_once __DIR__ . '/class-shop-questions-table.php';
	$table = new Dipe_Shop_Questions_Table( $filters );
	$table->prepare_items();
	$table->views();
	?>
	<form method="get" class="dipe-discussion-filters">
		<input type="hidden" name="post_type" value="product"><input type="hidden" name="page" value="dipe-product-questions"><input type="hidden" name="q_status" value="<?php echo esc_attr( $filters['q_status'] ); ?>"><input type="hidden" name="order" value="<?php echo esc_attr( $filters['order'] ); ?>">
		<label>Respuesta<select name="q_answer"><option value="all">Todas</option><option value="unanswered" <?php selected( $filters['q_answer'], 'unanswered' ); ?>>Sin respuesta</option><option value="answered" <?php selected( $filters['q_answer'], 'answered' ); ?>>Respondidas</option></select></label>
		<label>Producto<select class="wc-product-search" name="product_id" data-placeholder="Buscar producto…" data-action="woocommerce_json_search_products" data-allow_clear="true" style="width:260px">
			<?php if ( $filters['product_id'] ) : ?><option value="<?php echo esc_attr( $filters['product_id'] ); ?>" selected><?php echo esc_html( get_the_title( $filters['product_id'] ) ); ?></option><?php endif; ?>
		</select></label>
		<label>Buscar pregunta<input type="search" name="s" value="<?php echo esc_attr( $filters['s'] ); ?>" placeholder="Texto de la pregunta"></label>
		<?php submit_button( 'Filtrar', 'secondary', '', false ); ?> <a href="<?php echo esc_url( dipe_core_shop_questions_url() ); ?>">Limpiar filtros</a>
	</form>
	<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
		<input type="hidden" name="action" value="dipe_shop_question_action"><input type="hidden" name="return_to" value="<?php echo esc_url( dipe_core_shop_questions_url( $filters ) ); ?>">
		<?php wp_nonce_field( 'dipe_shop_questions_bulk', 'dipe_questions_nonce' ); $table->display(); ?>
	</form>
	<?php
	echo '</div>';
}

function dipe_core_shop_question_editor( $question, $filters ) {
	if ( ! dipe_core_shop_question_can_edit( $question ) || 'trash' === $question->post_status ) {
		echo '<p>No puedes editar esta pregunta. Si está en la papelera, restáurala primero.</p>';
		return;
	}
	$user = get_userdata( $question->post_author );
	$answer = (string) get_post_meta( $question->ID, '_dipe_product_answer', true );
	?>
	<p><a href="<?php echo esc_url( dipe_core_shop_questions_url( $filters ) ); ?>">← Volver al listado con sus filtros</a></p>
	<div class="dipe-discussion-detail">
		<div class="dipe-discussion-panel"><h2><?php echo esc_html( get_the_title( $question->post_parent ) ?: 'Producto no disponible' ); ?></h2><p class="description"><?php echo esc_html( ( $user ? $user->display_name : ( $question->post_author ? 'Usuario eliminado' : 'Invitado' ) ) . ' · ' . get_the_date( 'd/m/Y H:i', $question ) ); ?></p><p class="dipe-discussion-text"><?php echo esc_html( $question->post_content ); ?></p>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
			<input type="hidden" name="action" value="dipe_shop_answer_question"><input type="hidden" name="question_id" value="<?php echo esc_attr( $question->ID ); ?>"><input type="hidden" name="return_to" value="<?php echo esc_url( dipe_core_shop_questions_url( $filters ) ); ?>">
			<?php wp_nonce_field( 'dipe_shop_answer_' . $question->ID ); ?>
			<p><label for="dipe-question-answer"><strong>Respuesta de la tienda</strong></label></p><textarea class="large-text" id="dipe-question-answer" name="answer" rows="8" maxlength="4000"><?php echo esc_textarea( $answer ); ?></textarea>
			<p class="description">Una respuesta oficial por pregunta. Si la dejas vacía, la pregunta seguirá figurando como «Sin respuesta».</p>
			<p><label for="dipe-question-visibility">Visibilidad</label> <select id="dipe-question-visibility" name="decision"><option value="publish" <?php selected( $question->post_status, 'publish' ); ?>>Publicada</option><option value="pending" <?php selected( $question->post_status, 'pending' ); ?>>Oculta / pendiente</option></select></p>
			<?php submit_button( 'Guardar pregunta y respuesta' ); ?>
		</form></div>
		<aside class="dipe-discussion-panel"><h2>Estado</h2><p><?php echo esc_html( 'publish' === $question->post_status ? 'Publicada en la ficha del producto.' : 'Oculta: no aparece en la ficha.' ); ?></p><p><?php echo esc_html( '' === $answer ? 'Sin respuesta.' : 'Respondida.' ); ?></p><p>Responder y publicar son decisiones independientes. No se envían correos automáticos.</p></aside>
	</div>
	<?php
}

function dipe_core_shop_answer_question() {
	if ( ! dipe_core_shop_discussions_can_manage() ) wp_die( 'No tienes permisos para responder preguntas.', '', array( 'response' => 403 ) );
	if ( 'POST' !== ( $_SERVER['REQUEST_METHOD'] ?? '' ) ) wp_die( 'Método no permitido.', '', array( 'response' => 405 ) );
	$id = isset( $_POST['question_id'] ) && is_scalar( $_POST['question_id'] ) ? absint( $_POST['question_id'] ) : 0;
	check_admin_referer( 'dipe_shop_answer_' . $id );
	$question = get_post( $id );
	if ( ! dipe_core_shop_question_can_edit( $question ) || 'trash' === $question->post_status ) wp_die( 'No puedes modificar esta pregunta.', '', array( 'response' => 403 ) );
	$decision = isset( $_POST['decision'] ) && is_string( $_POST['decision'] ) ? sanitize_key( wp_unslash( $_POST['decision'] ) ) : '';
	if ( ! in_array( $decision, array( 'publish', 'pending' ), true ) || ! isset( $_POST['answer'] ) || ! is_string( $_POST['answer'] ) ) wp_die( 'Los datos no son válidos.', '', array( 'response' => 400 ) );
	$answer = trim( sanitize_textarea_field( wp_unslash( $_POST['answer'] ) ) );
	if ( strlen( $answer ) > 16000 ) wp_die( 'La respuesta es demasiado larga.', '', array( 'response' => 400 ) );
	if ( '' === $answer ) delete_post_meta( $id, '_dipe_product_answer' );
	else update_post_meta( $id, '_dipe_product_answer', wp_slash( $answer ) );
	if ( (string) get_post_meta( $id, '_dipe_product_answer', true ) !== $answer ) wp_die( 'No se ha podido guardar la respuesta.', '', array( 'response' => 500 ) );
	$result = wp_update_post( array( 'ID' => $id, 'post_status' => $decision ), true );
	if ( is_wp_error( $result ) || ! $result ) wp_die( 'No se ha podido guardar la pregunta.', '', array( 'response' => 500 ) );
	wp_safe_redirect( add_query_arg( array( 'saved' => 1, 'question_id' => $id ), dipe_core_shop_questions_return_url() ) );
	exit;
}
add_action( 'admin_post_dipe_shop_answer_question', 'dipe_core_shop_answer_question' );

function dipe_core_shop_question_action() {
	if ( ! dipe_core_shop_discussions_can_manage() ) wp_die( 'No tienes permisos para administrar preguntas.', '', array( 'response' => 403 ) );
	if ( 'POST' !== ( $_SERVER['REQUEST_METHOD'] ?? '' ) ) wp_die( 'Método no permitido.', '', array( 'response' => 405 ) );
	check_admin_referer( 'dipe_shop_questions_bulk', 'dipe_questions_nonce' );
	$ids = isset( $_POST['question_ids'] ) && is_array( $_POST['question_ids'] ) ? array_values( array_unique( array_filter( array_map( static function ( $id ) { return is_scalar( $id ) ? absint( $id ) : 0; }, $_POST['question_ids'] ) ) ) ) : array();
	$operation = '';
	foreach ( array( 'question_bulk_action', 'question_bulk_action2' ) as $key ) if ( '' === $operation && isset( $_POST[ $key ] ) && is_string( $_POST[ $key ] ) ) $operation = sanitize_key( $_POST[ $key ] );
	if ( isset( $_POST['question_single_action'] ) && is_string( $_POST['question_single_action'] ) ) {
		$single = explode( ':', wp_unslash( $_POST['question_single_action'] ), 2 );
		$operation = sanitize_key( $single[0] );
		$ids = isset( $single[1] ) ? array( absint( $single[1] ) ) : array();
	}
	if ( '' === $operation && ! $ids ) {
		$page = isset( $_POST['paged'] ) && is_scalar( $_POST['paged'] ) ? max( 1, absint( $_POST['paged'] ) ) : 1;
		wp_safe_redirect( add_query_arg( 'paged', $page, dipe_core_shop_questions_return_url() ) );
		exit;
	}
	if ( ! in_array( $operation, array( 'publish', 'pending', 'trash', 'restore' ), true ) || ! $ids || count( $ids ) > 100 ) wp_die( 'Selecciona una acción y entre 1 y 100 preguntas.', '', array( 'response' => 400 ) );
	$changed = 0;
	foreach ( $ids as $id ) {
		$question = get_post( $id );
		if ( ! dipe_core_shop_question_can_edit( $question ) || ( 'trash' === $operation && ! dipe_core_shop_question_can_trash( $question ) ) ) continue;
		if ( 'restore' === $operation ) $result = 'trash' === $question->post_status ? wp_untrash_post( $id ) : false;
		elseif ( 'trash' === $operation ) $result = 'trash' !== $question->post_status && EMPTY_TRASH_DAYS ? wp_trash_post( $id ) : false;
		else $result = 'trash' !== $question->post_status ? wp_update_post( array( 'ID' => $id, 'post_status' => $operation ), true ) : false;
		if ( $result && ! is_wp_error( $result ) ) ++$changed;
	}
	wp_safe_redirect( add_query_arg( array( 'changed' => $changed, 'failed' => count( $ids ) - $changed ), dipe_core_shop_questions_return_url() ) );
	exit;
}
add_action( 'admin_post_dipe_shop_question_action', 'dipe_core_shop_question_action' );

add_filter( 'wp_untrash_post_status', function ( $status, $id, $previous ) {
	return 'dipe_product_qa' === get_post_type( $id ) ? ( in_array( $previous, array( 'publish', 'pending' ), true ) ? $previous : 'pending' ) : $status;
}, 10, 3 );

// Afecta a nuevas opiniones de productos, no a comentarios del blog ni a aprobaciones.
add_filter( 'pre_comment_approved', function ( $approved, $data ) {
	if ( is_wp_error( $approved ) || in_array( $approved, array( 'spam', 'trash', 'post-trashed' ), true ) || 'product' !== get_post_type( absint( $data['comment_post_ID'] ?? 0 ) ) ) return $approved;
	if ( ! in_array( $data['comment_type'] ?? '', array( '', 'comment', 'review' ), true ) ) return $approved;
	$staff_reply = ! empty( $data['comment_parent'] ) && current_user_can( 'edit_products' ) && current_user_can( 'moderate_comments' );
	return $staff_reply ? $approved : 0;
}, PHP_INT_MAX, 2 );

add_action( 'comment_post', function ( $id ) {
	$comment = get_comment( $id );
	if ( $comment && $comment->comment_parent && (int) $comment->user_id === get_current_user_id() && 'product' === get_post_type( $comment->comment_post_ID ) && current_user_can( 'edit_products' ) && current_user_can( 'moderate_comments' ) ) update_comment_meta( $id, '_dipe_shop_store_reply', '1' );
}, 20 );

/** Identifica respuestas oficiales actuales y conserva las marcadas históricamente. */
function dipe_core_shop_staff_reply_sql() {
	global $wpdb;
	static $staff_ids = null;
	if ( null === $staff_ids ) $staff_ids = array_map( 'absint', get_users( array( 'capability__in' => array( 'edit_products', 'manage_woocommerce' ), 'fields' => 'ID' ) ) );
	$ids = implode( ',', $staff_ids ?: array( 0 ) );
	return "(dipe_reply.user_id IN ($ids) OR EXISTS (SELECT 1 FROM {$wpdb->commentmeta} dipe_marker WHERE dipe_marker.comment_id = dipe_reply.comment_ID AND dipe_marker.meta_key = '_dipe_shop_store_reply' AND dipe_marker.meta_value = '1'))";
}

function dipe_core_shop_review_answer_flags( $ids ) {
	global $wpdb;
	static $cache = array();
	$ids = array_values( array_unique( array_filter( array_map( 'absint', $ids ) ) ) );
	$missing = array_values( array_filter( $ids, static function ( $id ) use ( $cache ) { return ! array_key_exists( $id, $cache ); } ) );
	if ( $missing ) {
		foreach ( $missing as $id ) $cache[ $id ] = false;
		$placeholders = implode( ',', array_fill( 0, count( $missing ), '%d' ) );
		$staff = dipe_core_shop_staff_reply_sql();
		$sql = "SELECT DISTINCT dipe_reply.comment_parent FROM {$wpdb->comments} dipe_reply INNER JOIN {$wpdb->comments} dipe_parent ON dipe_parent.comment_ID = dipe_reply.comment_parent AND dipe_parent.comment_post_ID = dipe_reply.comment_post_ID WHERE dipe_reply.comment_parent IN ($placeholders) AND dipe_reply.comment_approved = '1' AND $staff";
		foreach ( $wpdb->get_col( $wpdb->prepare( $sql, $missing ) ) as $id ) $cache[ (int) $id ] = true;
	}
	return array_intersect_key( $cache, array_flip( $ids ) );
}

function dipe_core_shop_review_answer_filter() {
	$value = isset( $_GET['dipe_answer_state'] ) && is_string( $_GET['dipe_answer_state'] ) ? sanitize_key( wp_unslash( $_GET['dipe_answer_state'] ) ) : '';
	return in_array( $value, array( 'answered', 'unanswered' ), true ) ? $value : 'all';
}

add_filter( 'woocommerce_product_reviews_list_table_item_types', function ( $types ) {
	// El estado de respuesta pertenece a una opinión, no a su fila de respuesta.
	return 'all' === dipe_core_shop_review_answer_filter() ? $types : array( 'review' => $types['review'] ?? 'Opiniones' );
} );

add_filter( 'woocommerce_product_reviews_list_table_prepare_items_args', function ( $args ) {
	$args['dipe_shop_review_admin'] = true;
	$filter = dipe_core_shop_review_answer_filter();
	if ( 'all' !== $filter ) {
		$args['parent'] = 0;
		$args['type'] = 'review';
		$args['dipe_shop_review_answered'] = $filter;
	}
	return $args;
} );

add_filter( 'comments_clauses', function ( $clauses, $query ) {
	global $wpdb;
	$state = $query->query_vars['dipe_shop_review_answered'] ?? '';
	if ( empty( $query->query_vars['dipe_shop_review_admin'] ) || ! in_array( $state, array( 'answered', 'unanswered' ), true ) ) return $clauses;
	$operator = 'answered' === $state ? 'EXISTS' : 'NOT EXISTS';
	$staff = dipe_core_shop_staff_reply_sql();
	$clauses['where'] .= " AND $operator (SELECT 1 FROM {$wpdb->comments} dipe_reply WHERE dipe_reply.comment_parent = {$wpdb->comments}.comment_ID AND dipe_reply.comment_post_ID = {$wpdb->comments}.comment_post_ID AND dipe_reply.comment_approved = '1' AND $staff)";
	return $clauses;
}, 10, 2 );

// Precarga por página para evitar una consulta de respuestas por cada fila.
add_filter( 'the_comments', function ( $comments, $query ) {
	if ( is_array( $comments ) && ! empty( $query->query_vars['dipe_shop_review_admin'] ) ) {
		$ids = array();
		foreach ( $comments as $comment ) if ( $comment instanceof WP_Comment && ! $comment->comment_parent ) $ids[] = $comment->comment_ID;
		dipe_core_shop_review_answer_flags( $ids );
	}
	return $comments;
}, 10, 2 );

add_filter( 'woocommerce_product_reviews_table_columns', function ( $columns ) {
	$columns['dipe_answer'] = 'Respuesta';
	return $columns;
} );

add_action( 'woocommerce_product_reviews_table_column_dipe_answer', function ( $comment ) {
	if ( $comment->comment_parent ) { echo '<span class="description">Respuesta a una opinión</span>'; return; }
	$flags = dipe_core_shop_review_answer_flags( array( $comment->comment_ID ) );
	$answered = ! empty( $flags[ $comment->comment_ID ] );
	echo '<span class="dipe-discussion-badge ' . ( $answered ? 'is-answered' : 'is-waiting' ) . '">' . ( $answered ? 'Respondida' : 'Sin respuesta' ) . '</span>';
} );

// Mantiene búsqueda, estrellas y respuesta al cambiar entre pendientes/publicadas.
add_filter( 'views_product_page_product-reviews', function ( $views ) {
	$args = array( 'dipe_answer_state' => dipe_core_shop_review_answer_filter() );
	if ( isset( $_GET['review_rating'] ) && is_scalar( $_GET['review_rating'] ) ) $args['review_rating'] = min( 5, absint( $_GET['review_rating'] ) );
	if ( isset( $_GET['s'] ) && is_string( $_GET['s'] ) ) $args['s'] = sanitize_text_field( wp_unslash( $_GET['s'] ) );
	foreach ( $views as $key => $view ) {
		$tags = new WP_HTML_Tag_Processor( $view );
		if ( $tags->next_tag( 'A' ) ) {
			$href = $tags->get_attribute( 'href' );
			if ( is_string( $href ) ) $tags->set_attribute( 'href', add_query_arg( $args, $href ) );
		}
		$views[ $key ] = $tags->get_updated_html();
	}
	return $views;
} );

add_filter( 'woocommerce_product_reviews_list_table', function ( $html ) {
	$state = dipe_core_shop_review_answer_filter();
	ob_start();
	?>
	<div class="dipe-discussion-review-filter"><label for="dipe-review-answer">Respuesta de la tienda</label><select id="dipe-review-answer" name="dipe_answer_state"><option value="all">Cualquier estado de respuesta</option><option value="unanswered" <?php selected( $state, 'unanswered' ); ?>>Opiniones sin respuesta</option><option value="answered" <?php selected( $state, 'answered' ); ?>>Opiniones respondidas</option></select> <?php submit_button( 'Filtrar', 'secondary', 'filter_action', false ); ?></div>
	<?php
	$filter = ob_get_clean();
	// Hook público de WooCommerce: añade el filtro al mismo form que estrellas/producto.
	$html = preg_replace_callback( '/<form\b[^>]*\bid=["\x27]reviews-filter["\x27][^>]*>/i', static function ( $match ) use ( $filter ) { return $match[0] . $filter; }, $html, 1 );
	return '<div class="wrap dipe-shop-discussions">' . dipe_core_shop_discussions_nav( 'reviews' ) . '<p>Las nuevas opiniones requieren aprobación antes de ser públicas. Combina estado, estrellas, producto, búsqueda y respuesta de la tienda. Puedes aprobar y responder con las acciones nativas de cada fila.</p></div>' . $html;
} );
