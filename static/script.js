document.addEventListener("DOMContentLoaded", async () => {
    await loadFiles();
    synchronizeScrolling();
    setupFormSubmission();
});

async function loadFiles() {
    const response = await fetch('/nodes/random/2');
    const data = await response.json();

    window.nodes = data;

    document.getElementById('file1').textContent = data.nodes[0].text;
    document.getElementById('file2').textContent = data.nodes[1].text;
}

function synchronizeScrolling() {
    let file1 = document.getElementById('file1');
    let file2 = document.getElementById('file2');
    file1.onscroll = () => { file2.scrollTop = file1.scrollTop; };
    file2.onscroll = () => { file1.scrollTop = file2.scrollTop; };
}

function setupFormSubmission() {
    document.getElementById('submitAnnotation').onclick = async () => {
        const inputText = document.getElementById('inputText').value;
        const similarity = document.getElementById('similarity').value;

        if (!inputText || !similarity) {
            alert('Both annotation and similarity are required.');
            return;
        }

        const annotationId = generateUUID();
        // Assuming you have an endpoint to handle this data
        const response = await fetch('/submit_annotation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                annotationId,
                text: inputText,
                similarity,
                files: [window.file1.id, window.file2.id]
            }),
        });

        if (response.ok) {
            // Clear form fields after successful submission
            document.getElementById('inputText').value = '';
            document.getElementById('similarity').value = '';

            // Reload files for new annotation
            await loadFiles();
        } else {
            // Handle errors or unsuccessful submission
            alert('Failed to submit annotation.');
        }
    };
}

function generateUUID() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}
