document.addEventListener("DOMContentLoaded", async () => {
    await loadFiles();
    synchronizeScrolling();
    setupFormSubmission();
});

async function loadFiles() {
    const response = await fetch('/nodes/random/2');
    const data = await response.json();

    document.getElementById('file1').data = data.nodes[0];
    document.getElementById('file2').data = data.nodes[1];
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

        let file1 = document.getElementById('file1');
        let file2 = document.getElementById('file2');

        const annotationNode = {
            id: generateUUID(),
            name: `similarity_annotation`,
            timestamp: Date.now(),
            origin: "link_annotator",
            text: inputText,
        };

        const annotationLink1 = {
            source: annotationNode.id,
            target: file1.data.id
        };

        const annotationLink2 = {
            source: annotationNode.id,
            target: file2.data.id,
        };

        const annotatedSimilarity = {
            source: file1.data.id,
            target: file2.data.id,
            human_similarity: parseFloat(similarity),
        };

        const response = await fetch('/annotate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                annotation_node: annotationNode,
                annotation_links: [annotationLink1, annotationLink2, annotatedSimilarity],
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
