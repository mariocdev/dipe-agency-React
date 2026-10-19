document.querySelectorAll('form[data-dipe-submissions]').forEach((form) => {
  const selectAll = form.querySelector('[data-dipe-select-all]');
  const checkboxes = [...form.querySelectorAll('input[name="submission_ids[]"]:not(:disabled)')];

  selectAll?.addEventListener('change', () => {
    checkboxes.forEach((checkbox) => { checkbox.checked = selectAll.checked; });
  });
  checkboxes.forEach((checkbox) => checkbox.addEventListener('change', () => {
    const selected = checkboxes.filter((item) => item.checked).length;
    if (selectAll) {
      selectAll.checked = checkboxes.length > 0 && selected === checkboxes.length;
      selectAll.indeterminate = selected > 0 && selected < checkboxes.length;
    }
  }));

  form.addEventListener('submit', (event) => {
    const single = event.submitter?.name === 'single_action';
    const action = single ? event.submitter.value.split(':')[0] : form.elements.bulk_action?.value;
    const count = single ? 1 : checkboxes.filter((checkbox) => checkbox.checked).length;
    const target = count === 1 ? 'esta solicitud' : `${count} solicitudes`;
    if (action === 'delete' && count > 0 && !window.confirm(`Se eliminará${count === 1 ? '' : 'n'} definitivamente ${target}. Esta acción no se puede deshacer. ¿Continuar?`)) {
      event.preventDefault();
    }
  });
});
