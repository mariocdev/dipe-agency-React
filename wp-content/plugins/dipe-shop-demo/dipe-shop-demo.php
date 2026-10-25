<?php
/**
 * Plugin Name: Dipe — preparación de tienda demo
 * Description: Prepara un catálogo físico ficticio y ajustes opcionales de WooCommerce desde Herramientas. No modifica datos al activarse.
 * Version: 1.0.0
 * Requires at least: 6.4
 * Requires PHP: 8.2
 * Requires Plugins: woocommerce
 * Author: Dipe Agency
 */

defined( 'ABSPATH' ) || exit;

final class Dipe_Shop_Demo {

	private const MARKER = '_dipe_shop_demo';
	private const SLOT = '_dipe_shop_demo_slot';
	private const READY = '_dipe_shop_demo_ready';
	private const LOCK = 'dipe_shop_demo_lock';
	private const ZONE = 'dipe_shop_demo_shipping_zone';

	/** Solo administradores con permisos efectivos sobre los productos. */
	private static function allowed() {
		return current_user_can( 'manage_options' ) && current_user_can( 'manage_woocommerce' )
			&& current_user_can( 'edit_products' ) && current_user_can( 'publish_products' )
			&& current_user_can( 'delete_products' ) && current_user_can( 'manage_product_terms' );
	}

	private static function available() {
		return class_exists( 'WooCommerce' ) && class_exists( 'WC_Product_Simple' ) && did_action( 'woocommerce_init' );
	}

	public static function menu() {
		add_management_page( 'Tienda demo Dipe', 'Tienda demo Dipe', 'manage_options', 'dipe-shop-demo', array( self::class, 'render' ) );
	}

	/** Precios, existencias y textos son exclusivamente datos ficticios de maquetación. */
	private static function catalog() {
		return array(
			'libreta-naranja' => array( 'name' => 'Libreta naranja A5', 'category' => 'papeleria', 'price' => '12.90', 'sale' => '9.90', 'stock' => 24, 'color' => array( 'naranja' ), 'tags' => array( 'oficina', 'regalo' ), 'weight' => '0.25', 'detail' => 'Libreta de tapa rígida con páginas punteadas. Formato A5 para ideas, bocetos y notas del día a día.' ),
			'cuaderno-negro' => array( 'name' => 'Cuaderno negro de proyectos', 'category' => 'papeleria', 'price' => '16.90', 'stock' => 16, 'color' => array( 'negro' ), 'tags' => array( 'oficina' ), 'weight' => '0.35', 'detail' => 'Cuaderno de proyectos con apertura plana, páginas numeradas y espacio para organizar tareas.' ),
			'bloc-notas' => array( 'name' => 'Bloc de notas de escritorio', 'category' => 'papeleria', 'price' => '6.90', 'stock' => 0, 'color' => array( 'blanco' ), 'tags' => array( 'oficina' ), 'weight' => '0.15', 'detail' => 'Bloc de hojas desprendibles para listas y recordatorios. Este artículo permite maquetar el estado de producto agotado.' ),
			'pack-libretas' => array( 'name' => 'Pack de tres libretas', 'category' => 'papeleria', 'price' => '24.90', 'sale' => '21.90', 'stock' => 10, 'color' => array( 'naranja', 'negro', 'blanco' ), 'tags' => array( 'oficina', 'regalo' ), 'weight' => '0.60', 'detail' => 'Un único producto formado por tres libretas de colores. No necesita una extensión de packs ni permite elegir componentes.' ),
			'bolsa-natural' => array( 'name' => 'Bolsa de algodón natural', 'category' => 'bolsas-y-accesorios', 'price' => '12.90', 'stock' => 30, 'color' => array( 'natural' ), 'tags' => array( 'textil', 'regalo' ), 'weight' => '0.12', 'detail' => 'Bolsa de asas largas y tejido ligero, pensada para transportar pequeños objetos cotidianos.' ),
			'bolsa-negra' => array( 'name' => 'Bolsa negra de uso diario', 'category' => 'bolsas-y-accesorios', 'price' => '14.90', 'stock' => 18, 'color' => array( 'negro' ), 'tags' => array( 'textil' ), 'weight' => '0.18', 'detail' => 'Bolsa de tejido resistente con asas anchas y bolsillo interior para objetos pequeños.' ),
			'mochila-urbana' => array( 'name' => 'Mochila urbana naranja', 'category' => 'bolsas-y-accesorios', 'price' => '39.90', 'sale' => '34.90', 'stock' => 8, 'color' => array( 'naranja' ), 'tags' => array( 'oficina', 'textil' ), 'weight' => '0.55', 'detail' => 'Mochila compacta con compartimento principal, bolsillo frontal y tirantes ajustables.' ),
			'neceser' => array( 'name' => 'Neceser de viaje negro', 'category' => 'bolsas-y-accesorios', 'price' => '18.90', 'stock' => 0, 'color' => array( 'negro' ), 'tags' => array( 'regalo' ), 'weight' => '0.20', 'detail' => 'Neceser de cierre superior para organizar accesorios. Agotado de forma intencionada en la demostración.' ),
			'camiseta' => array( 'name' => 'Camiseta Dipe', 'category' => 'ropa', 'price' => '24.90', 'stock' => 8, 'color' => array( 'naranja', 'negro', 'blanco' ), 'size' => array( 's', 'm', 'l', 'xl' ), 'tags' => array( 'textil', 'regalo' ), 'weight' => '0.20', 'detail' => 'Camiseta de corte recto. Elige talla y color para consultar el precio y las existencias de cada combinación.' ),
			'sudadera' => array( 'name' => 'Sudadera Dipe', 'category' => 'ropa', 'price' => '49.90', 'sale' => '44.90', 'stock' => 6, 'color' => array( 'negro', 'natural' ), 'size' => array( 's', 'm', 'l', 'xl' ), 'tags' => array( 'textil' ), 'weight' => '0.65', 'detail' => 'Sudadera con capucha y bolsillo frontal. Disponible en dos colores y cuatro tallas para recorrer las variaciones.' ),
			'gorra' => array( 'name' => 'Gorra negra ajustable', 'category' => 'ropa', 'price' => '19.90', 'stock' => 20, 'color' => array( 'negro' ), 'tags' => array( 'textil', 'regalo' ), 'weight' => '0.10', 'detail' => 'Gorra de talla única con cierre ajustable y visera curva.' ),
			'calcetines' => array( 'name' => 'Calcetines naranjas', 'category' => 'ropa', 'price' => '9.90', 'stock' => 25, 'color' => array( 'naranja' ), 'tags' => array( 'textil' ), 'weight' => '0.08', 'detail' => 'Par de calcetines de talla única para completar el catálogo de prendas sencillas.' ),
		);
	}

	/** La marca y el identificador de lote evitan confundir productos ajenos. */
	private static function owned_ids( $type = 'product', $slot = '', $active_only = false ) {
		$args = array(
			'post_type' => $type, 'post_status' => array_values( get_post_stati() ),
			'posts_per_page' => -1, 'fields' => 'ids', 'orderby' => 'ID', 'order' => 'ASC',
			'meta_query' => array( array( 'key' => self::MARKER, 'value' => 'v1' ) ),
		);
		if ( $slot ) {
			$args['meta_query'][] = array( 'key' => self::SLOT, 'value' => $slot );
		}
		$ids = get_posts( $args );
		return $active_only ? array_values( array_filter( $ids, static fn( $id ) => 'trash' !== get_post_status( $id ) ) ) : $ids;
	}

	private static function state() {
		$ready = 0;
		foreach ( self::owned_ids() as $id ) {
			if ( 'trash' !== get_post_status( $id ) && '1' === get_post_meta( $id, self::READY, true ) ) {
				++$ready;
			}
		}
		return array( 'ready' => $ready, 'total' => count( self::catalog() ), 'active' => count( self::owned_ids( 'product', '', true ) ) );
	}

	/** Serializa creación, retirada y ajustes frente a otras pestañas. */
	private static function lock() {
		$locked_at = (int) get_option( self::LOCK );
		if ( $locked_at && $locked_at < time() - 600 ) {
			delete_option( self::LOCK );
		}
		if ( ! add_option( self::LOCK, time(), '', false ) ) {
			throw new RuntimeException( 'Hay una operación en curso. Espera a que termine; tras una interrupción el bloqueo caduca en diez minutos.' );
		}
	}

	/** Reutiliza términos por slug; solo los nuevos reciben marca de propiedad. */
	private static function term( $taxonomy, $slug, $name, $description = '' ) {
		$term = get_term_by( 'slug', $slug, $taxonomy );
		if ( $term ) {
			return (int) $term->term_id;
		}
		$result = wp_insert_term( $name, $taxonomy, array( 'slug' => $slug, 'description' => $description ) );
		if ( is_wp_error( $result ) ) {
			throw new RuntimeException( $result->get_error_message() );
		}
		add_term_meta( $result['term_id'], self::MARKER, 'v1', true );
		return (int) $result['term_id'];
	}

	/** Registra también en esta petición los atributos recién creados. */
	private static function attribute( $slug, $label, $values ) {
		$id = wc_attribute_taxonomy_id_by_name( $slug );
		if ( ! $id ) {
			$id = wc_create_attribute( array( 'name' => $label, 'slug' => $slug, 'type' => 'select', 'order_by' => 'menu_order', 'has_archives' => false ) );
			if ( is_wp_error( $id ) ) {
				throw new RuntimeException( $id->get_error_message() );
			}
		}
		$taxonomy = wc_attribute_taxonomy_name( $slug );
		if ( ! taxonomy_exists( $taxonomy ) ) {
			register_taxonomy( $taxonomy, array( 'product' ), array( 'label' => $label, 'public' => false, 'hierarchical' => false, 'show_ui' => false, 'rewrite' => false ) );
		}
		$terms = array();
		foreach ( $values as $value => $name ) {
			$terms[ $value ] = self::term( $taxonomy, $value, $name );
		}
		return array( 'id' => (int) $id, 'taxonomy' => $taxonomy, 'terms' => $terms );
	}

	private static function vocabulary() {
		$categories = array();
		foreach ( array( 'papeleria' => 'Papelería', 'bolsas-y-accesorios' => 'Bolsas y accesorios', 'ropa' => 'Ropa' ) as $slug => $name ) {
			$categories[ $slug ] = self::term( 'product_cat', $slug, $name, 'Categoría del catálogo ficticio de demostración Dipe.' );
		}
		$tags = array();
		foreach ( array( 'demo-dipe' => 'Demo Dipe', 'oficina' => 'Oficina', 'regalo' => 'Regalo', 'textil' => 'Textil' ) as $slug => $name ) {
			$tags[ $slug ] = self::term( 'product_tag', $slug, $name );
		}
		return array(
			'categories' => $categories, 'tags' => $tags,
			'color' => self::attribute( 'color', 'Color', array( 'naranja' => 'Naranja', 'negro' => 'Negro', 'blanco' => 'Blanco', 'natural' => 'Natural' ) ),
			'size' => self::attribute( 'talla', 'Talla', array( 's' => 'S', 'm' => 'M', 'l' => 'L', 'xl' => 'XL' ) ),
		);
	}

	/** Una sola imagen local provisional; no descarga medios de terceros. */
	private static function image() {
		$ids = self::owned_ids( 'attachment', 'image' );
		foreach ( $ids as $id ) {
			if ( 'trash' !== get_post_status( $id ) && is_file( (string) get_attached_file( $id ) ) ) {
				return (int) $id;
			}
		}
		$source = '';
		foreach ( array( 'placeholder.webp', 'placeholder.png' ) as $filename ) {
			if ( is_file( WC_ABSPATH . 'assets/images/' . $filename ) ) {
				$source = WC_ABSPATH . 'assets/images/' . $filename;
				break;
			}
		}
		if ( ! $source || ! is_readable( $source ) ) {
			throw new RuntimeException( 'No se encuentra la imagen provisional local de WooCommerce.' );
		}
		$bytes = file_get_contents( $source );
		if ( false === $bytes ) {
			throw new RuntimeException( 'No se ha podido leer la imagen provisional.' );
		}
		$filename = 'dipe-demo-catalogo.' . pathinfo( $source, PATHINFO_EXTENSION );
		$upload = wp_upload_bits( $filename, null, $bytes );
		if ( $upload['error'] ) {
			throw new RuntimeException( $upload['error'] );
		}
		$filetype = wp_check_filetype( $filename );
		$id = wp_insert_attachment( array(
			'post_mime_type' => $filetype['type'], 'post_title' => 'Imagen provisional — demo Dipe', 'post_status' => 'inherit',
			'meta_input' => array( self::MARKER => 'v1', self::SLOT => 'image', '_wp_attachment_image_alt' => 'Imagen provisional del catálogo de demostración' ),
		), $upload['file'], 0, true );
		if ( is_wp_error( $id ) ) {
			wp_delete_file( $upload['file'] );
			throw new RuntimeException( $id->get_error_message() );
		}
		require_once ABSPATH . 'wp-admin/includes/image.php';
		wp_update_attachment_metadata( $id, wp_generate_attachment_metadata( $id, $upload['file'] ) );
		return (int) $id;
	}

	private static function sku_available( $sku, $id = 0 ) {
		$existing = wc_get_product_id_by_sku( $sku );
		if ( $existing && (int) $existing !== (int) $id ) {
			throw new RuntimeException( 'El SKU ' . $sku . ' pertenece a otro producto. No se ha modificado. Cambia ese SKU o revisa el conflicto antes de reanudar.' );
		}
	}

	/** Solo restaura las copias propias que el administrador pide volver a crear. */
	private static function restore( $id ) {
		if ( 'trash' === get_post_status( $id ) ) {
			if ( ! wp_untrash_post( $id ) ) {
				throw new RuntimeException( 'No se ha podido restaurar un producto de demostración.' );
			}
			$product = wc_get_product( $id );
			if ( $product ) {
				$product->set_status( 'publish' );
				$product->save();
			}
		}
	}

	/** Completa un producto por petición, conservando los que ya están terminados. */
	private static function create_next() {
		foreach ( self::catalog() as $slot => $data ) {
			$ids = self::owned_ids( 'product', $slot );
			$id = $ids ? (int) $ids[0] : 0;
			if ( $id && '1' === get_post_meta( $id, self::READY, true ) && 'trash' !== get_post_status( $id ) ) {
				continue;
			}
			$vocabulary = self::vocabulary();
			$image_id = self::image();
			if ( $id && '1' === get_post_meta( $id, self::READY, true ) ) {
				foreach ( self::owned_ids( 'product_variation' ) as $child_id ) {
					if ( (int) wp_get_post_parent_id( $child_id ) === $id ) {
						self::restore( $child_id );
					}
				}
				self::restore( $id );
				if ( wc_get_product( $id )->is_type( 'variable' ) ) {
					WC_Product_Variable::sync( $id );
				}
				return false;
			}
			$variable = ! empty( $data['size'] );
			$sku = 'DIPE-DEMO-' . strtoupper( $slot );
			self::sku_available( $sku, $id );
			$product = $id ? wc_get_product( $id ) : ( $variable ? new WC_Product_Variable() : new WC_Product_Simple() );
			if ( ! $product || $product->is_type( 'variable' ) !== $variable ) {
				throw new RuntimeException( 'El tipo de un producto incompleto ha cambiado. Revísalo antes de continuar.' );
			}
			$product->set_name( $data['name'] . ' — DEMO' );
			if ( ! $id ) {
				$product->set_slug( 'demo-dipe-' . $slot );
			}
			$product->set_sku( $sku );
			$product->set_status( 'draft' );
			$product->set_virtual( false );
			$product->set_downloadable( false );
			$product->set_catalog_visibility( 'visible' );
			$product->set_description( '<p><strong>Producto ficticio de demostración. No disponible para venta real.</strong></p><p>' . esc_html( $data['detail'] ) . '</p><h2>Información del producto</h2><p>Características, precios, medidas y existencias de ejemplo para preparar la tienda Dipe. La imagen es provisional.</p>' );
			$product->set_short_description( $data['detail'] . ' Producto ficticio; imagen provisional.' );
			$product->set_category_ids( array( $vocabulary['categories'][ $data['category'] ] ) );
			$tag_ids = array( $vocabulary['tags']['demo-dipe'] );
			foreach ( $data['tags'] as $tag ) {
				$tag_ids[] = $vocabulary['tags'][ $tag ];
			}
			$product->set_tag_ids( $tag_ids );
			$product->set_image_id( $image_id );
			$product->set_reviews_allowed( true );
			$product->set_tax_status( 'none' );
			$product->set_weight( $data['weight'] );
			$product->set_backorders( 'no' );
			$product->set_menu_order( array_search( $slot, array_keys( self::catalog() ), true ) );
			$product->update_meta_data( self::MARKER, 'v1' );
			$product->update_meta_data( self::SLOT, $slot );
			$attributes = array();
			foreach ( array( 'color', 'size' ) as $key ) {
				if ( empty( $data[ $key ] ) ) {
					continue;
				}
				$definition = $vocabulary[ $key ];
				$attribute = new WC_Product_Attribute();
				$attribute->set_id( $definition['id'] );
				$attribute->set_name( $definition['taxonomy'] );
				$attribute->set_options( array_map( static fn( $value ) => $definition['terms'][ $value ], $data[ $key ] ) );
				$attribute->set_position( count( $attributes ) );
				$attribute->set_visible( true );
				$attribute->set_variation( $variable );
				$attributes[] = $attribute;
			}
			$product->set_attributes( $attributes );
			$product->set_manage_stock( ! $variable );
			if ( ! $variable ) {
				$product->set_regular_price( $data['price'] );
				$product->set_sale_price( $data['sale'] ?? '' );
				$product->set_stock_quantity( $data['stock'] );
				$product->set_stock_status( $data['stock'] ? 'instock' : 'outofstock' );
			}
			$id = $product->save();
			if ( $variable ) {
				self::variations( $id, $slot, $data, $vocabulary );
				WC_Product_Variable::sync( $id );
				$product = wc_get_product( $id );
			}
			$product->set_status( 'publish' );
			$product->update_meta_data( self::READY, '1' );
			$product->save();
			wc_delete_product_transients( $id );
			return false;
		}
		return true;
	}

	/** Variaciones con SKU estable y stock propio, incluidas combinaciones agotadas. */
	private static function variations( $parent_id, $slot, $data, $vocabulary ) {
		$index = 0;
		foreach ( $data['color'] as $color ) {
			foreach ( $data['size'] as $size ) {
				$child_slot = $slot . '/' . $color . '/' . $size;
				$ids = self::owned_ids( 'product_variation', $child_slot );
				$id = $ids ? (int) $ids[0] : 0;
				$sku = 'DIPE-DEMO-' . strtoupper( $slot . '-' . $color . '-' . $size );
				self::sku_available( $sku, $id );
				$variation = $id ? wc_get_product( $id ) : new WC_Product_Variation();
				if ( ! $variation || ! $variation->is_type( 'variation' ) || ( $id && (int) $variation->get_parent_id() !== $parent_id ) ) {
					throw new RuntimeException( 'Una variación demo ya no pertenece al producto esperado. No se ha modificado.' );
				}
				$variation->set_parent_id( $parent_id );
				$variation->set_sku( $sku );
				$variation->set_status( 'publish' );
				$variation->set_attributes( array( $vocabulary['color']['taxonomy'] => $color, $vocabulary['size']['taxonomy'] => $size ) );
				$variation->set_regular_price( $data['price'] );
				$variation->set_sale_price( $data['sale'] ?? '' );
				$variation->set_manage_stock( true );
				$stock = 0 === $index % 5 ? 0 : $data['stock'];
				$variation->set_stock_quantity( $stock );
				$variation->set_stock_status( $stock ? 'instock' : 'outofstock' );
				$variation->set_backorders( 'no' );
				$variation->set_tax_status( 'none' );
				$variation->set_weight( $data['weight'] );
				$variation->set_menu_order( $index++ );
				$variation->update_meta_data( self::MARKER, 'v1' );
				$variation->update_meta_data( self::SLOT, $child_slot );
				$variation->save();
			}
		}
	}

	/** Envía solo nuestros productos a papelera y conserva vocabulario e imágenes. */
	private static function trash_next() {
		if ( defined( 'EMPTY_TRASH_DAYS' ) && 0 === (int) EMPTY_TRASH_DAYS ) {
			throw new RuntimeException( 'La papelera está desactivada en esta instalación. No se retiran productos para evitar un borrado definitivo.' );
		}
		$ids = self::owned_ids( 'product', '', true );
		if ( ! $ids ) {
			return true;
		}
		$id = (int) $ids[0];
		$children = get_posts( array( 'post_type' => 'product_variation', 'post_parent' => $id, 'post_status' => array_values( get_post_stati() ), 'posts_per_page' => -1, 'fields' => 'ids' ) );
		foreach ( $children as $child_id ) {
			if ( 'v1' !== get_post_meta( $child_id, self::MARKER, true ) ) {
				throw new RuntimeException( 'El producto demo contiene una variación ajena a la herramienta. Revísala manualmente antes de retirarlo.' );
			}
		}
		foreach ( $children as $child_id ) {
			if ( 'trash' !== get_post_status( $child_id ) && ! wp_trash_post( $child_id ) ) {
				throw new RuntimeException( 'No se ha podido enviar una variación a la papelera.' );
			}
		}
		if ( ! wp_trash_post( $id ) ) {
			throw new RuntimeException( 'No se ha podido enviar un producto a la papelera.' );
		}
		wc_delete_product_transients( $id );
		return false;
	}

	public static function ajax() {
		if ( ! self::available() || ! self::allowed() ) {
			wp_send_json_error( array( 'message' => 'WooCommerce debe estar activo y necesitas permisos de administrador y productos.' ), 403 );
		}
		if ( 'POST' !== ( $_SERVER['REQUEST_METHOD'] ?? '' ) ) {
			wp_send_json_error( array( 'message' => 'Método no permitido.' ), 405 );
		}
		check_ajax_referer( 'dipe_shop_demo', 'nonce' );
		$operation = isset( $_POST['operation'] ) && is_string( $_POST['operation'] ) ? sanitize_key( wp_unslash( $_POST['operation'] ) ) : '';
		if ( ! in_array( $operation, array( 'create', 'trash' ), true ) ) {
			wp_send_json_error( array( 'message' => 'Operación no válida.' ), 400 );
		}
		$locked = false;
		$error_message = '';
		try {
			self::lock();
			$locked = true;
			$done = 'create' === $operation ? self::create_next() : self::trash_next();
		} catch ( Throwable $error ) {
			$error_message = $error->getMessage();
		} finally {
			if ( $locked ) {
				delete_option( self::LOCK );
			}
		}
		if ( $error_message ) {
			wp_send_json_error( array( 'message' => $error_message, 'state' => self::state() ), 500 );
		}
		wp_send_json_success( array( 'done' => $done, 'state' => self::state() ) );
	}

	/** Respeta asignaciones nativas; crea solo páginas que todavía falten. */
	private static function pages() {
		foreach ( array(
			'shop' => array( 'tienda', 'Tienda', '' ),
			'cart' => array( 'carrito', 'Carrito', '[woocommerce_cart]' ),
			'checkout' => array( 'finalizar-compra', 'Finalizar compra', '[woocommerce_checkout]' ),
			'myaccount' => array( 'mi-cuenta', 'Mi cuenta', '[woocommerce_my_account]' ),
		) as $key => $data ) {
			$option = 'woocommerce_' . $key . '_page_id';
			$current_id = absint( get_option( $option ) );
			$current = $current_id ? get_post( $current_id ) : null;
			if ( $current && 'page' === $current->post_type && 'trash' !== $current->post_status ) {
				continue;
			}
			$existing = get_page_by_path( $data[0], OBJECT, 'page' );
			if ( $existing && 'v1' !== get_post_meta( $existing->ID, self::MARKER, true ) ) {
				throw new RuntimeException( 'Ya existe /' . $data[0] . '/. Asígnala manualmente en los ajustes de WooCommerce; la herramienta no la sobrescribe.' );
			}
			$id = $existing ? $existing->ID : wp_insert_post( array(
				'post_type' => 'page', 'post_status' => 'publish', 'post_title' => $data[1], 'post_name' => $data[0], 'post_content' => $data[2],
				'meta_input' => array( self::MARKER => 'v1' ),
			), true );
			if ( is_wp_error( $id ) ) {
				throw new RuntimeException( $id->get_error_message() );
			}
			if ( 'publish' !== get_post_status( $id ) ) {
				throw new RuntimeException( 'La página /' . $data[0] . '/ no está publicada. Revísala en Páginas antes de asignarla.' );
			}
			update_option( $option, (int) $id );
		}
	}

	/** Zona opcional de ejemplo: nunca modifica una zona previamente existente. */
	private static function shipping( $country, $cost ) {
		$id = absint( get_option( self::ZONE ) );
		$zone = $id ? new WC_Shipping_Zone( $id ) : null;
		if ( $zone && $zone->get_id() ) {
			return;
		}
		if ( WC_Shipping_Zones::get_zones() || WC_Shipping_Zones::get_zone( 0 )->get_shipping_methods() ) {
			throw new RuntimeException( 'Ya hay zonas o métodos de envío. Se conservan; configura el envío de ejemplo manualmente si lo necesitas.' );
		}
		$zone = new WC_Shipping_Zone();
		$zone->set_zone_name( 'DIPE DEMO — envío de ejemplo' );
		$zone->set_zone_order( 0 );
		$zone->save();
		update_option( self::ZONE, $zone->get_id(), false );
		$zone->add_location( $country, 'country' );
		$zone->save();
		$instance_id = $zone->add_shipping_method( 'flat_rate' );
		if ( ! $instance_id ) {
			throw new RuntimeException( 'No se ha podido añadir la tarifa. Revisa la zona de envío demo en WooCommerce.' );
		}
		update_option( 'woocommerce_flat_rate_' . $instance_id . '_settings', array( 'title' => 'Envío de demostración', 'tax_status' => 'none', 'cost' => $cost, 'type' => 'order' ) );
		WC_Cache_Helper::get_transient_version( 'shipping', true );
	}

	public static function settings() {
		if ( ! self::available() || ! self::allowed() ) {
			wp_die( 'WooCommerce debe estar activo y necesitas permisos de administrador y productos.', '', array( 'response' => 403 ) );
		}
		if ( 'POST' !== ( $_SERVER['REQUEST_METHOD'] ?? '' ) ) {
			wp_die( 'Método no permitido.', '', array( 'response' => 405 ) );
		}
		check_admin_referer( 'dipe_shop_demo_settings' );
		$locked = false;
		try {
			self::lock();
			$locked = true;
			$currency = isset( $_POST['currency'] ) && is_string( $_POST['currency'] ) ? sanitize_text_field( wp_unslash( $_POST['currency'] ) ) : '';
			$country = isset( $_POST['country'] ) && is_string( $_POST['country'] ) ? sanitize_text_field( wp_unslash( $_POST['country'] ) ) : '';
			$cost_raw = isset( $_POST['shipping_cost'] ) && is_string( $_POST['shipping_cost'] ) ? trim( wp_unslash( $_POST['shipping_cost'] ) ) : '';
			$cost = wc_format_decimal( $cost_raw );
			if ( ! isset( get_woocommerce_currencies()[ $currency ] ) || ! isset( WC()->countries->get_countries()[ $country ] ) ) {
				throw new RuntimeException( 'Moneda o país no válidos.' );
			}
			if ( isset( $_POST['shipping'] ) && ( ! preg_match( '/^\d+(?:[.,]\d{1,2})?$/D', $cost_raw ) || ! is_numeric( $cost ) || (float) $cost > 1000 ) ) {
				throw new RuntimeException( 'Indica un coste de envío entre 0 y 1000, con hasta dos decimales.' );
			}
			if ( isset( $_POST['pages'] ) ) {
				self::pages();
				flush_rewrite_rules( false );
			}
			if ( isset( $_POST['shipping'] ) ) {
				self::shipping( $country, $cost );
			}
			update_option( 'woocommerce_currency', $currency );
			if ( isset( $_POST['stock'] ) ) {
				update_option( 'woocommerce_manage_stock', 'yes' );
				update_option( 'woocommerce_hide_out_of_stock_items', 'no' );
			}
			if ( isset( $_POST['reviews'] ) ) {
				update_option( 'woocommerce_enable_reviews', 'yes' );
				update_option( 'woocommerce_enable_review_rating', 'yes' );
				update_option( 'woocommerce_review_rating_required', 'yes' );
				update_option( 'woocommerce_review_rating_verification_label', 'yes' );
				update_option( 'woocommerce_review_rating_verification_required', 'yes' );
			}
			$message = 'Ajustes aplicados. Revisa abajo las URL asignadas. No se han configurado pagos, impuestos ni correos.';
		} catch ( Throwable $error ) {
			$message = 'Operación incompleta: ' . $error->getMessage() . ' Los pasos anteriores pueden haberse guardado; revisa antes de repetir.';
		} finally {
			if ( $locked ) {
				delete_option( self::LOCK );
			}
		}
		set_transient( 'dipe_shop_demo_notice_' . get_current_user_id(), $message, 120 );
		wp_safe_redirect( admin_url( 'tools.php?page=dipe-shop-demo' ) );
		exit;
	}

	public static function render() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		echo '<div class="wrap"><h1>Tienda demo Dipe</h1>';
		if ( ! self::available() || ! self::allowed() ) {
			echo '<p>Activa WooCommerce y utiliza un administrador con permisos de productos para preparar la demo.</p></div>';
			return;
		}
		$notice_key = 'dipe_shop_demo_notice_' . get_current_user_id();
		$notice = get_transient( $notice_key );
		if ( $notice ) {
			echo '<div class="notice notice-info"><p>' . esc_html( $notice ) . '</p></div>';
			delete_transient( $notice_key );
		}
		$state = self::state();
		?>
		<p>Herramienta temporal para preparar la maquetación. Activarla no cambia datos. Cada operación requiere pulsar su botón.</p>
		<h2>1. Catálogo físico de demostración</h2>
		<p>12 productos (10 simples y 2 variables), 20 variaciones, 3 categorías, 4 etiquetas y atributos globales Color/Talla. Incluye ofertas y agotados, sin reseñas inventadas, clientes ni pedidos.</p>
		<p>Los precios y las existencias son ficticios. Los productos se publican como «DEMO», sin impuestos, con una imagen provisional local de WooCommerce compartida. Se pueden sustituir sus imágenes y editar sus datos desde Productos.</p>
		<p><strong>Publicar estos productos no desactiva las pasarelas existentes.</strong> Utiliza esta herramienta en tu instalación de pruebas y mantén los cobros reales desactivados mientras prepares la tienda.</p>
		<p id="dipe-demo-state"><?php echo esc_html( $state['ready'] . ' de ' . $state['total'] . ' productos completados; ' . $state['active'] . ' fuera de la papelera.' ); ?></p>
		<p><button type="button" class="button button-primary" data-dipe-demo="create">Crear / completar catálogo demo</button>
		<button type="button" class="button" data-dipe-demo="trash">Enviar productos demo a la papelera</button></p>
		<p id="dipe-demo-progress" role="status" aria-live="polite"></p>
		<p>Repetir la creación conserva tus ediciones en productos ya completados y restaura las copias demo que estén en papelera. La retirada conserva categorías, etiquetas, atributos, páginas, configuración e imagen; no borra pedidos ni productos ajenos.</p>
		<h2>2. Ajustes opcionales de WooCommerce</h2>
		<p>Se aplican únicamente al guardar este formulario. Afectan a la tienda completa. Los impuestos, dirección del negocio, cuentas, destinatarios, pasarelas y enlaces permanentes de productos/categorías se conservan.</p>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" id="dipe-demo-settings">
			<input type="hidden" name="action" value="dipe_shop_demo_settings">
			<?php wp_nonce_field( 'dipe_shop_demo_settings' ); ?>
			<table class="form-table" role="presentation">
				<tr><th scope="row"><label for="dipe-demo-currency">Moneda</label></th><td><select id="dipe-demo-currency" name="currency">
				<?php foreach ( get_woocommerce_currencies() as $code => $label ) : ?>
					<option value="<?php echo esc_attr( $code ); ?>" <?php selected( get_woocommerce_currency(), $code ); ?>><?php echo esc_html( $label . ' (' . $code . ')' ); ?></option>
				<?php endforeach; ?>
				</select><p class="description">Se muestra la moneda actual. Los importes de muestra no se convierten al cambiarla.</p></td></tr>
				<tr><th scope="row">Catálogo</th><td><label><input type="checkbox" name="stock" value="1" checked> Activar gestión de stock y mostrar también productos agotados.</label><br>
				<label><input type="checkbox" name="reviews" value="1" checked> Activar reseñas con estrellas obligatorias y escritura solo de compradores verificados.</label></td></tr>
				<tr><th scope="row">Páginas</th><td><label><input type="checkbox" name="pages" value="1" checked> Crear y asignar solo las páginas WooCommerce que falten.</label><p class="description">Conserva páginas y URL ya asignadas. Las nuevas usarán tienda, carrito, finalizar-compra y mi-cuenta. El tema React todavía necesita implementar sus pantallas.</p></td></tr>
				<tr><th scope="row">Envío de ejemplo</th><td><label><input type="checkbox" name="shipping" value="1"> Crear una zona con tarifa fija de demostración, solo si todavía no hay zonas ni métodos.</label><p><label for="dipe-demo-country">País de esa zona</label> <select id="dipe-demo-country" name="country">
				<?php foreach ( WC()->countries->get_countries() as $code => $label ) : ?>
					<option value="<?php echo esc_attr( $code ); ?>" <?php selected( WC()->countries->get_base_country(), $code ); ?>><?php echo esc_html( $label ); ?></option>
				<?php endforeach; ?>
				</select></p><p><label for="dipe-demo-cost">Coste ficticio, en la moneda elegida</label> <input id="dipe-demo-cost" name="shipping_cost" type="number" min="0" max="1000" step="0.01" value="4.90"></p><p class="description">No cambia los países de venta ni la ubicación del negocio. La zona demo no se reconfigura al guardar de nuevo: edítala desde los ajustes de envío.</p></td></tr>
			</table>
			<?php submit_button( 'Aplicar estos ajustes' ); ?>
		</form>
		<h2>3. URL y siguientes pasos</h2>
		<ul>
		<?php foreach ( array( 'shop' => 'Tienda', 'cart' => 'Carrito', 'checkout' => 'Compra', 'myaccount' => 'Mi cuenta' ) as $key => $label ) :
			$id = wc_get_page_id( $key );
			$url = $id > 0 ? get_permalink( $id ) : '';
			?>
			<li><?php echo esc_html( $label . ': ' ); ?><?php if ( $url ) : ?><a href="<?php echo esc_url( $url ); ?>"><?php echo esc_html( $url ); ?></a> (<?php echo esc_html( get_post_status( $id ) ); ?>)<?php else : ?>sin página asignada<?php endif; ?></li>
		<?php endforeach; ?>
		</ul>
		<p><a href="<?php echo esc_url( admin_url( 'edit.php?post_type=product' ) ); ?>">Abrir productos</a> · <a href="<?php echo esc_url( admin_url( 'admin.php?page=wc-settings' ) ); ?>">Abrir ajustes WooCommerce</a></p>
		<p>Este plugin prepara datos para Store API. No añade la tienda a React, filtros visuales, pagos, descargas ni recuperación de carritos. Una vez preparado el catálogo puedes desactivarlo sin perderlo.</p>
		<script>
		(() => {
			const config = <?php echo wp_json_encode( array( 'url' => admin_url( 'admin-ajax.php' ), 'nonce' => wp_create_nonce( 'dipe_shop_demo' ) ) ); ?>;
			const buttons = document.querySelectorAll('[data-dipe-demo]');
			const progress = document.getElementById('dipe-demo-progress');
			const state = document.getElementById('dipe-demo-state');
			const settingsSubmit = document.querySelector('#dipe-demo-settings input[type="submit"]');
			let running = false;
			for (const button of buttons) button.addEventListener('click', async () => {
				if (running) return;
				const operation = button.dataset.dipeDemo;
				const prompt = operation === 'create'
					? 'Se publicarán 12 productos ficticios. Las copias demo en papelera se restaurarán y tus ediciones en productos terminados se conservarán. ¿Continuar?'
					: 'Se enviarán los productos de esta demo y sus variaciones a la papelera. Se conservarán configuración, páginas, vocabulario e imagen. ¿Continuar?';
				if (!window.confirm(prompt)) return;
				running = true;
				for (const control of buttons) control.disabled = true;
				settingsSubmit.disabled = true;
				try {
					let done = false;
					while (!done) {
						progress.textContent = operation === 'create' ? 'Preparando catálogo por lotes… Mantén esta pantalla abierta.' : 'Enviando productos a la papelera…';
						const response = await fetch(config.url, { method: 'POST', credentials: 'same-origin', body: new URLSearchParams({ action: 'dipe_shop_demo', nonce: config.nonce, operation }) });
						const result = await response.json();
						if (result.data?.state) {
							const value = result.data.state;
							state.textContent = `${value.ready} de ${value.total} productos completados; ${value.active} fuera de la papelera.`;
						}
						if (!response.ok || !result.success) throw new Error(result.data?.message || 'La petición no se ha completado.');
						done = result.data.done;
					}
					progress.textContent = operation === 'create' ? 'Catálogo preparado. Puedes editarlo en Productos y aplicar los ajustes opcionales.' : 'Productos demo enviados a la papelera.';
				} catch (error) {
					progress.textContent = `${error.message} Lo ya completado se conserva. Recarga para renovar la sesión y vuelve a pulsar el botón para reanudar.`;
				} finally {
					running = false;
					for (const control of buttons) control.disabled = false;
					settingsSubmit.disabled = false;
				}
			});
		})();
		</script>
		<?php
		echo '</div>';
	}
}

add_action( 'admin_menu', array( Dipe_Shop_Demo::class, 'menu' ) );
add_action( 'wp_ajax_dipe_shop_demo', array( Dipe_Shop_Demo::class, 'ajax' ) );
add_action( 'admin_post_dipe_shop_demo_settings', array( Dipe_Shop_Demo::class, 'settings' ) );
