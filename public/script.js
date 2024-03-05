$(document).ready(() => {
    fetchFiles();
});

function fetchFiles() {
    $.ajax({
        url: '/files',
        method: 'GET',
        success: function(data) {
            $("#fileTableBody").empty();

            data.forEach(function(file) {
                var row =
                    "<tr>" +
                    "<td>" + file.name + "</td>" +
                    '<td><a href="' + file.url + '" target="_blank">' + file.url + "</a></td>" +
                    "<td>" +
                    '<a href="/files/' + encodeURIComponent(file.name) + '/download" class="btn btn-primary download-button">Download</a>' +
                    '<button class="btn btn-danger delete-button" data-name="' + file.name + '">Delete</button>' +
                    "</td>" +
                    "</tr>";

                $("#fileTableBody").append(row);
            });
            
            attachDeleteHandlers();
            attachDownloadHandlers();

        },
        error: function(error) {
            console.log("error fetching files", error);
        }
    });
}

function attachDeleteHandlers() {
    $(".delete-button").click(function(){
        var filename =$(this).data("name")
        if(confirm("Are you sure you want to delete the image" + filename)){
            deleteFile(filename)
        }
        
    })
}

function deleteFile(filename){
    $.ajax({
        url: '/files/' + filename,
        method: 'DELETE',
        success: function() {
            fetchFiles();
        },
        error: function(error) {
            console.log("error deleting file", error);
        }
    });
}

function attachDownloadHandlers() {
    $(".download-button").click(function(e) {
        e.preventDefault()
        var downloadUrl = $(this).attr('href')
        downloadFile(downloadUrl)
    });
}
    function downloadFile(url) {
        var link= document.createElement('a')
        link.href=url
        link.setAttribute("download", "");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }



