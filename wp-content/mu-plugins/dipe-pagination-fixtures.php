<?php
/**
 * Plugin Name: Dipe — contenido de prueba para paginación
 * Description: Herramienta de paginación retirada; no registra menú ni acciones de creación o borrado.
 * Version: 1.0.1
 * Requires PHP: 8.2
 */

defined( 'ABSPATH' ) || exit;

final class Dipe_Pagination_Fixtures {
	private const MARKER = '_dipe_pagination_fixture';
	private const SLOT = '_dipe_pagination_slot';
	private const READY = '_dipe_pagination_ready';
	private const LOCK = 'dipe_pagination_fixtures_lock';
	private const TARGET = 40;
	private const BATCH = 4;
	private const SOURCES = array(
		'dipe_proyecto' => array(
			'slug' => 'congreso-de-escuelas-de-negocios-y-direccion',
			'taxonomy' => 'dipe_project_category',
			'label' => 'Proyectos',
		),
		'post' => array(
			'slug' => 'que-es-un-sitemap-y-guia-para-crearlo-deforma-correcta',
			'taxonomy' => 'category',
			'label' => 'Entradas',
		),
	);

	public static function menu() {
		add_management_page( 'Contenido de prueba', 'Contenido de prueba', 'manage_options', 'dipe-pagination-fixtures', array( self::class, 'render' ) );
	}

	/** Include trashed and unfinished copies so cleanup can always find them. */
	private static function copies() {
		return get_posts( array(
			'post_type' => array_keys( self::SOURCES ),
			'post_status' => array_values( get_post_stati() ),
			'posts_per_page' => -1,
			'orderby' => 'ID',
			'order' => 'ASC',
			'meta_key' => self::MARKER,
			'meta_value' => 'v1',
		) );
	}

	private static function state() {
		$state = array( 'total' => 0, 'ready' => array_fill_keys( array_keys( self::SOURCES ), 0 ) );
		foreach ( self::copies() as $copy ) {
			++$state['total'];
			if ( 'publish' === $copy->post_status && '1' === get_post_meta( $copy->ID, self::READY, true ) ) {
				++$state['ready'][ $copy->post_type ];
			}
		}
		return $state;
	}

	/** Resolve the originals on this installation; no staging domain is stored. */
	private static function sources() {
		$sources = array();
		foreach ( self::SOURCES as $type => $settings ) {
			$source = get_page_by_path( $settings['slug'], OBJECT, $type );
			if ( ! $source || 'publish' !== $source->post_status || get_post_meta( $source->ID, self::MARKER, true ) ) {
				throw new RuntimeException( 'No se encuentra el original publicado: ' . $settings['slug'] );
			}
			if ( ! current_user_can( 'edit_post', $source->ID ) ) {
				throw new RuntimeException( 'No tienes permisos para duplicar el original.' );
			}
			$sources[ $type ] = $source;
		}
		return $sources;
	}

	/** Use all existing categories, including empty ones, without creating terms. */
	private static function terms( $taxonomy ) {
		if ( ! taxonomy_exists( $taxonomy ) ) {
			throw new RuntimeException( 'No está disponible la taxonomía ' . $taxonomy . '. Comprueba que Dipe Core está activo.' );
		}
		$terms = get_terms( array( 'taxonomy' => $taxonomy, 'hide_empty' => false, 'orderby' => 'term_id', 'order' => 'ASC' ) );
		if ( is_wp_error( $terms ) ) {
			throw new RuntimeException( $terms->get_error_message() );
		}
		if ( 'dipe_related_service' === $taxonomy ) {
			$terms = array_values( array_filter( $terms, static function ( $term ) {
				$page = get_post( absint( get_term_meta( $term->term_id, 'dipe_service_page', true ) ) );
				return $page && 'page' === $page->post_type && 'publish' === $page->post_status;
			} ) );
		}
		if ( ! $terms ) {
			throw new RuntimeException( 'Añade al menos un término a ' . $taxonomy . ' (los servicios necesitan una página publicada).' );
		}
		return $terms;
	}

	private static function require_saved( $result ) {
		if ( is_wp_error( $result ) ) {
			throw new RuntimeException( $result->get_error_message() );
		}
		if ( false === $result || 0 === $result ) {
			throw new RuntimeException( 'No se ha podido guardar una copia. Puedes reanudar la creación o borrar las copias.' );
		}
		return $result;
	}

	private static function duplicate( $source, $slot, $categories, $services ) {
		// Start as a marked draft: partial work remains identifiable after interruption.
		$id = self::require_saved( wp_insert_post( wp_slash( array(
			'post_type' => $source->post_type,
			'post_status' => 'draft',
			'post_title' => $source->post_title,
			'post_content' => $source->post_content,
			'post_content_filtered' => $source->post_content_filtered,
			'post_excerpt' => $source->post_excerpt,
			'post_author' => $source->post_author,
			'post_date' => $source->post_date,
			'post_date_gmt' => $source->post_date_gmt,
			'post_name' => $source->post_name . '-prueba-' . sprintf( '%02d', $slot ),
			'post_password' => $source->post_password,
			'post_parent' => $source->post_parent,
			'menu_order' => $source->menu_order,
			'comment_status' => $source->comment_status,
			'ping_status' => $source->ping_status,
			'meta_input' => array( self::MARKER => 'v1', self::SLOT => $slot ),
		) ), true ) );

		try {
			foreach ( get_post_meta( $source->ID ) as $key => $values ) {
				if ( str_starts_with( $key, '_dipe_pagination_' ) || in_array( $key, array( '_edit_lock', '_edit_last', '_wp_old_slug', '_wp_old_date' ), true ) ) {
					continue;
				}
				// Replace any defaults inserted by save hooks, preserving repeated meta rows.
				delete_post_meta( $id, $key );
				foreach ( $values as $value ) {
					self::require_saved( add_post_meta( $id, wp_slash( $key ), wp_slash( maybe_unserialize( $value ) ) ) );
				}
			}

			$category_taxonomy = self::SOURCES[ $source->post_type ]['taxonomy'];
			foreach ( get_object_taxonomies( $source->post_type ) as $taxonomy ) {
				$ids = wp_get_object_terms( $source->ID, $taxonomy, array( 'fields' => 'ids' ) );
				if ( is_wp_error( $ids ) ) {
					throw new RuntimeException( $ids->get_error_message() );
				}
				if ( $category_taxonomy === $taxonomy ) {
					$ids = array( (int) $categories[ ( $slot - 1 ) % count( $categories ) ]->term_id );
				} elseif ( 'dipe_related_service' === $taxonomy ) {
					// Rotate independently so every available service gets copies.
					$index = ( $slot - 1 ) % count( $services );
					$ids = array( (int) $services[ $index ]->term_id );
				}
				self::require_saved( wp_set_object_terms( $id, array_map( 'intval', $ids ), $taxonomy ) );
				if ( $category_taxonomy === $taxonomy ) {
					$primary_key = '_yoast_wpseo_primary_' . $taxonomy;
					if ( metadata_exists( 'post', $id, $primary_key ) ) {
						update_post_meta( $id, $primary_key, $ids[0] );
						if ( (int) get_post_meta( $id, $primary_key, true ) !== $ids[0] ) {
							throw new RuntimeException( 'No se ha podido actualizar la categoría principal de la copia.' );
						}
					}
				}
			}

			self::require_saved( wp_update_post( wp_slash( array( 'ID' => $id, 'post_status' => 'publish' ) ), true ) );
			self::require_saved( update_post_meta( $id, self::READY, '1' ) );
		} catch ( Throwable $error ) {
			wp_delete_post( $id, true );
			throw $error;
		}
	}

	private static function create_batch() {
		$sources = self::sources();
		$services = self::terms( 'dipe_related_service' );
		$categories = array();
		foreach ( self::SOURCES as $type => $settings ) {
			$categories[ $type ] = self::terms( $settings['taxonomy'] );
		}
		$existing = array();
		foreach ( self::copies() as $copy ) {
			$existing[ $copy->post_type ][ (int) get_post_meta( $copy->ID, self::SLOT, true ) ] = $copy;
		}
		$created = 0;
		for ( $slot = 1; $slot <= self::TARGET; ++$slot ) {
			foreach ( $sources as $type => $source ) {
				$copy = $existing[ $type ][ $slot ] ?? null;
				if ( $copy && 'publish' === $copy->post_status && '1' === get_post_meta( $copy->ID, self::READY, true ) ) {
					continue;
				}
				if ( $created >= self::BATCH ) {
					return false;
				}
				if ( $copy ) {
					self::require_saved( wp_delete_post( $copy->ID, true ) );
				}
				self::duplicate( $source, $slot, $categories[ $type ], $services );
				++$created;
			}
		}
		return true;
	}

	private static function delete_batch() {
		foreach ( array_slice( self::copies(), 0, self::BATCH ) as $copy ) {
			// Recheck ownership immediately before permanent deletion.
			if ( 'v1' === get_post_meta( $copy->ID, self::MARKER, true ) ) {
				self::require_saved( wp_delete_post( $copy->ID, true ) );
			}
		}
		return ! self::copies();
	}

	public static function ajax() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => 'No tienes permisos para gestionar estas copias.' ), 403 );
		}
		if ( 'POST' !== ( $_SERVER['REQUEST_METHOD'] ?? '' ) ) {
			wp_send_json_error( array( 'message' => 'Método no permitido.' ), 405 );
		}
		check_ajax_referer( 'dipe_pagination_fixtures', 'nonce' );
		$operation = isset( $_POST['operation'] ) ? sanitize_key( wp_unslash( $_POST['operation'] ) ) : '';
		if ( ! in_array( $operation, array( 'create', 'delete' ), true ) ) {
			wp_send_json_error( array( 'message' => 'Operación no válida.' ), 400 );
		}

		// Serialize batches, including requests from a second administrator/tab.
		$locked_at = (int) get_option( self::LOCK );
		if ( $locked_at && $locked_at < time() - 600 ) {
			delete_option( self::LOCK );
		}
		if ( ! add_option( self::LOCK, time(), '', false ) ) {
			wp_send_json_error( array( 'message' => 'Hay otro lote en curso. Espera y vuelve a intentarlo. Tras una interrupción, el bloqueo caduca en diez minutos.' ), 409 );
		}

		$error_message = '';
		$done = false;
		try {
			$done = 'create' === $operation ? self::create_batch() : self::delete_batch();
		} catch ( Throwable $error ) {
			$error_message = $error->getMessage();
		} finally {
			delete_option( self::LOCK );
		}
		$data = array( 'done' => $done, 'state' => self::state(), 'message' => $error_message );
		if ( $error_message ) {
			wp_send_json_error( $data, 500 );
		}
		wp_send_json_success( $data );
	}

	public static function render() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		$problem = '';
		try {
			$sources = self::sources();
			$services = self::terms( 'dipe_related_service' );
			foreach ( self::SOURCES as $settings ) {
				self::terms( $settings['taxonomy'] );
			}
		} catch ( Throwable $error ) {
			$problem = $error->getMessage();
		}
		$config = array( 'url' => admin_url( 'admin-ajax.php' ), 'nonce' => wp_create_nonce( 'dipe_pagination_fixtures' ), 'state' => self::state() );
		?>
		<div class="wrap" id="dipe-pagination-fixtures">
			<h1>Contenido de prueba para paginación</h1>
			<p>Crea 40 copias publicadas del proyecto Congreso de Escuelas de Negocios y Dirección y 40 de la entrada sobre el sitemap: 80 copias más los dos originales.</p>
			<p>Conserva los títulos, fechas, contenido, ACF, destacadas, galerías y demás etiquetas/metadatos. Solo cambia las categorías y servicios relacionados, repartidos entre los existentes, además de asignar una URL única y una marca interna a cada copia. Las imágenes y vídeos se reutilizan sin duplicar archivos.</p>
			<p>Los servicios se eligen entre los que tienen una página publicada. No crea categorías ni servicios nuevos. Las copias son contenido público y aparecerán en los listados según sus etiquetas, también en Home si el original está destacado.</p>
			<?php if ( $problem ) : ?>
				<div class="notice notice-error inline"><p><?php echo esc_html( $problem ); ?></p></div>
			<?php endif; ?>
			<p id="dipe-fixtures-count"></p>
			<p>
				<button type="button" class="button button-primary" data-operation="create" <?php disabled( (bool) $problem ); ?>>Crear / completar las 80 copias</button>
				<button type="button" class="button" data-operation="delete">Borrar todas las copias de prueba</button>
			</p>
			<p id="dipe-fixtures-progress" role="status" aria-live="polite"></p>
			<p>Mantén esta pantalla abierta hasta terminar. Trabaja en lotes pequeños; si se interrumpe, vuelve a pulsar el mismo botón para continuar. Repetir la creación completa solo las copias que faltan.</p>
			<p>El borrado es definitivo y afecta exclusivamente a las copias marcadas por esta herramienta, incluidas las que estén en la papelera. Conserva los originales, las categorías, los servicios y los archivos de la biblioteca de medios.</p>
		</div>
		<script>
		(() => {
			const config = <?php echo wp_json_encode( $config, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT ); ?>;
			const root = document.getElementById('dipe-pagination-fixtures');
			const buttons = [...root.querySelectorAll('[data-operation]')];
			const initiallyDisabled = buttons.map(button => button.disabled);
			const progress = document.getElementById('dipe-fixtures-progress');
			const count = document.getElementById('dipe-fixtures-count');
			let running = false;
			const showState = state => {
				count.textContent = `Copias publicadas: ${state.ready.dipe_proyecto}/40 proyectos y ${state.ready.post}/40 entradas. Total de copias marcadas: ${state.total} (incluye borradores y papelera).`;
			};
			showState(config.state);
			window.addEventListener('beforeunload', event => {
				if (running) { event.preventDefault(); event.returnValue = ''; }
			});
			buttons.forEach(button => button.addEventListener('click', async () => {
				if (running) return;
				const operation = button.dataset.operation;
				if (operation === 'delete' && !window.confirm('¿Borrar definitivamente todas las copias creadas por esta herramienta? Se conservarán los originales y los archivos de medios.')) return;
				running = true;
				buttons.forEach(item => { item.disabled = true; });
				progress.textContent = operation === 'create' ? 'Creando copias…' : 'Borrando copias…';
				try {
					let done = false;
					while (!done) {
						const response = await fetch(config.url, {
							method: 'POST', credentials: 'same-origin',
							body: new URLSearchParams({ action: 'dipe_pagination_fixtures', nonce: config.nonce, operation })
						});
						const result = await response.json();
						if (result.data?.state) showState(result.data.state);
						if (!response.ok || !result.success) throw new Error(result.data?.message || 'No se ha completado el lote. Recarga esta pantalla y vuelve a intentarlo.');
						done = result.data.done;
					}
					progress.textContent = operation === 'create' ? 'Creación terminada: 40 proyectos y 40 entradas de prueba.' : 'Borrado terminado.';
				} catch (error) {
					progress.textContent = `${error.message} El progreso anterior queda guardado; puedes reanudar o borrar las copias desde aquí.`;
				} finally {
					running = false;
					buttons.forEach((item, index) => { item.disabled = initiallyDisabled[index]; });
				}
			}));
		})();
		</script>
		<?php
	}
}

// Herramienta retirada: sin menú administrativo ni endpoint AJAX.
