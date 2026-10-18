(function ($) {
  $(function () {
    const list = $('#dipe-team-order-list');
    if (!list.length) return;

    function updatePositions(person) {
      list.children().each(function (index) {
        $(this).find('.dipe-team-order__position').text(index + 1);
      });
      if (person) {
        const name = person.find('.dipe-team-order__name').text();
        $('#dipe-team-order-feedback').text(name + ', posición ' + (person.index() + 1) + '. Pulsa Guardar orden para aplicar el cambio.');
      }
    }

    list.sortable({
      axis: 'y',
      handle: '.dipe-team-order__drag',
      items: '> .dipe-team-order__person',
      placeholder: 'dipe-team-order__placeholder',
      forcePlaceholderSize: true,
      update: function (event, ui) { updatePositions(ui.item); },
    });

    list.on('click', '.dipe-team-order__move', function () {
      const button = this;
      const person = $(button).closest('.dipe-team-order__person');
      const sibling = $(button).data('direction') === 'up' ? person.prev() : person.next();
      if (!sibling.length) return;
      if ($(button).data('direction') === 'up') person.insertBefore(sibling);
      else person.insertAfter(sibling);
      updatePositions(person);
      button.focus();
    });
  });
})(jQuery);
