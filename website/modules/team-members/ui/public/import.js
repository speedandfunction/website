apos.util.onReady(function () {
  const importButton = document.querySelector('[data-apos-import-peopleforce]');

  if (importButton) {
    importButton.addEventListener('click', async function () {
      try {
        const response = await apos.http.post('/api/v1/team-member/import');
        if (response.success) {
          alert('People imported successfully!');
          // You might want to refresh the list view after importing
          apos.notify(response.message, { type: 'success' });
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        console.error(error);
        apos.notify('There was an error importing people.', { type: 'error' });
      }
    });
  }
});
