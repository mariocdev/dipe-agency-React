<?php
/** Listado nativo de preguntas, con paginación y acciones reversibles. */
defined( 'ABSPATH' ) || exit;
require_once ABSPATH . 'wp-admin/includes/class-wp-list-table.php';

class Dipe_Shop_Questions_Table extends WP_List_Table {
	private $filters;

	public function __construct( $filters ) {
		$this->filters = $filters;
		parent::__construct( array( 'singular' => 'question', 'plural' => 'questions', 'ajax' => false ) );
	}

	public function get_columns() {
		return array( 'cb' => '<input type="checkbox">', 'question' => 'Pregunta', 'product' => 'Producto', 'author' => 'Autor', 'answer' => 'Respuesta', 'visibility' => 'Visibilidad', 'date' => 'Fecha' );
	}

	protected function get_sortable_columns() {
		return array( 'date' => array( 'date', true ) );
	}

	public function prepare_items() {
		$args = array(
			'post_type' => 'dipe_product_qa', 'post_status' => 'all' === $this->filters['q_status'] ? array( 'publish', 'pending' ) : $this->filters['q_status'],
			'posts_per_page' => 20, 'paged' => $this->get_pagenum(), 'orderby' => 'date', 'order' => $this->filters['order'],
			's' => $this->filters['s'],
		);
		if ( $this->filters['product_id'] ) $args['post_parent'] = $this->filters['product_id'];
		if ( 'answered' === $this->filters['q_answer'] ) {
			$args['meta_query'] = array( array( 'key' => '_dipe_product_answer', 'value' => '', 'compare' => '!=' ) );
		} elseif ( 'unanswered' === $this->filters['q_answer'] ) {
			$args['meta_query'] = array( 'relation' => 'OR', array( 'key' => '_dipe_product_answer', 'compare' => 'NOT EXISTS' ), array( 'key' => '_dipe_product_answer', 'value' => '', 'compare' => '=' ) );
		}
		$query = new WP_Query( $args );
		$this->items = $query->posts;
		$this->_column_headers = array( $this->get_columns(), array(), $this->get_sortable_columns(), 'question' );
		$this->set_pagination_args( array( 'total_items' => (int) $query->found_posts, 'per_page' => 20 ) );
	}

	protected function get_views() {
		$counts = wp_count_posts( 'dipe_product_qa' );
		$states = array( 'all' => array( 'Todas', (int) $counts->publish + (int) $counts->pending ), 'publish' => array( 'Publicadas', (int) $counts->publish ), 'pending' => array( 'Ocultas / pendientes', (int) $counts->pending ), 'trash' => array( 'Papelera', (int) $counts->trash ) );
		$views = array();
		foreach ( $states as $key => $state ) {
			$url = dipe_core_shop_questions_url( array_merge( $this->filters, array( 'q_status' => $key, 'paged' => 1 ) ) );
			$current = $key === $this->filters['q_status'] ? ' class="current" aria-current="page"' : '';
			$views[ $key ] = '<a href="' . esc_url( $url ) . '"' . $current . '>' . esc_html( $state[0] ) . ' <span class="count">(' . esc_html( number_format_i18n( $state[1] ) ) . ')</span></a>';
		}
		return $views;
	}

	protected function get_bulk_actions() {
		if ( 'trash' === $this->filters['q_status'] ) return array( 'restore' => 'Restaurar' );
		$actions = array( 'publish' => 'Publicar', 'pending' => 'Ocultar' );
		if ( EMPTY_TRASH_DAYS ) $actions['trash'] = 'Mover a la papelera';
		return $actions;
	}

	// Nombres propios: "action" queda reservado al controlador admin-post.php.
	protected function bulk_actions( $which = '' ) {
		$name = 'bottom' === $which ? 'question_bulk_action2' : 'question_bulk_action';
		echo '<label class="screen-reader-text" for="' . esc_attr( $name ) . '">Acciones en lote</label><select id="' . esc_attr( $name ) . '" name="' . esc_attr( $name ) . '"><option value="">Acciones en lote</option>';
		foreach ( $this->get_bulk_actions() as $value => $label ) echo '<option value="' . esc_attr( $value ) . '">' . esc_html( $label ) . '</option>';
		echo '</select> ';
		submit_button( 'Aplicar', 'action', '', false );
	}

	protected function column_cb( $item ) {
		if ( ! dipe_core_shop_question_can_edit( $item ) ) return '';
		return '<label class="screen-reader-text" for="question-' . esc_attr( $item->ID ) . '">Seleccionar pregunta ' . esc_html( $item->ID ) . '</label><input type="checkbox" id="question-' . esc_attr( $item->ID ) . '" name="question_ids[]" value="' . esc_attr( $item->ID ) . '">';
	}

	protected function column_question( $item ) {
		$text = wp_html_excerpt( $item->post_content, 160, '…' );
		$edit_url = add_query_arg( 'question_id', $item->ID, dipe_core_shop_questions_url( $this->filters ) );
		$editable = dipe_core_shop_question_can_edit( $item );
		$title = $editable && 'trash' !== $item->post_status ? '<a href="' . esc_url( $edit_url ) . '">' . esc_html( $text ) . '</a>' : esc_html( $text );
		$actions = array();
		if ( $editable ) {
			if ( 'trash' === $item->post_status ) {
				$actions['restore'] = $this->action_button( 'restore', $item->ID, 'Restaurar' );
			} else {
				$actions['edit'] = '<a href="' . esc_url( $edit_url ) . '">' . ( get_post_meta( $item->ID, '_dipe_product_answer', true ) ? 'Editar respuesta' : 'Responder' ) . '</a>';
				$state = 'publish' === $item->post_status ? 'pending' : 'publish';
				$actions['visibility'] = $this->action_button( $state, $item->ID, 'publish' === $state ? 'Publicar' : 'Ocultar' );
				if ( EMPTY_TRASH_DAYS && dipe_core_shop_question_can_trash( $item ) ) $actions['trash'] = $this->action_button( 'trash', $item->ID, 'Papelera' );
			}
		}
		return '<strong>' . $title . '</strong>' . $this->row_actions( $actions );
	}

	private function action_button( $operation, $id, $label ) {
		return '<button type="submit" class="button-link" name="question_single_action" value="' . esc_attr( $operation . ':' . $id ) . '">' . esc_html( $label ) . '</button>';
	}

	protected function column_product( $item ) {
		$title = get_the_title( $item->post_parent ) ?: 'Producto no disponible';
		$url = $item->post_parent ? get_permalink( $item->post_parent ) : false;
		return $url ? '<a href="' . esc_url( $url ) . '">' . esc_html( $title ) . '</a>' : esc_html( $title );
	}

	protected function column_author( $item ) {
		$user = get_userdata( $item->post_author );
		return esc_html( $user ? $user->display_name : ( $item->post_author ? 'Usuario eliminado' : 'Invitado' ) );
	}

	protected function column_answer( $item ) {
		$answer = (string) get_post_meta( $item->ID, '_dipe_product_answer', true );
		return '' !== $answer ? '<span class="dipe-discussion-badge is-answered">Respondida</span><p class="description">' . esc_html( wp_html_excerpt( $answer, 90, '…' ) ) . '</p>' : '<span class="dipe-discussion-badge is-waiting">Sin respuesta</span>';
	}

	protected function column_visibility( $item ) {
		$labels = array( 'publish' => 'Publicada', 'pending' => 'Oculta / pendiente', 'trash' => 'Papelera' );
		return esc_html( $labels[ $item->post_status ] ?? $item->post_status );
	}

	protected function column_date( $item ) {
		return esc_html( get_the_date( 'd/m/Y H:i', $item ) );
	}

	public function no_items() {
		echo 'No hay preguntas con estos filtros.';
	}
}
