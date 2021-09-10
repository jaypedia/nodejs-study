const sanitizeHtml = require('sanitize-html');

module.exports = {
  HTML: function (title, list, body, control) {
    return `
    <!doctype html>
    <html>
    <head>
      <title>WEB1 - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1><a href="/">☠MY WEB PRACTICE👻</a></h1>
      <a href="/author">Author👽</a>
      ${list}
      ${control}
      ${body}
    </body>
    </html>

    <style>
    body {
      background-color: #E5DCED;
    }
    a {
      background-color: lightgreen;
      text-decoration: none;
    }
    table {
      width: 100%;
      border-top: 1px solid #551A8B;
      border-collapse: collapse;
    }
    td, th {
      border-bottom: 1px solid #551A8B;
      border-left: 1px solid #551A8B;
      padding: 10px;
    }
    td:first-child, th:first-child {
      border-left: none;
    }
    </style>
    `;
  },
  list: function (topics) {
    var list = '<ul>';
    var i = 0;
    while (i < topics.length) {
      list =
        list +
        `<li><a href="/?id=${topics[i].id}">${sanitizeHtml(
          topics[i].title
        )}</a></li>`;
      i++;
    }
    list = list + '</ul>';
    return list;
  },
  authorSelect: function (authors, author_id) {
    var tag = '';
    var i = 0;
    while (i < authors.length) {
      let selected = '';
      if (author_id === authors[i].id) {
        selected = ' selected';
      }
      tag += `<option value="${authors[i].id}" ${selected}>${sanitizeHtml(
        authors[i].name
      )}</option>`;
      i++;
    }
    return `<select name="author">${tag}</select>`;
  },
  authorTable: function (authors) {
    var tag =
      '<table><thead><tr><th>Name</th><th>Profile</th><th>Update</th><th>Delete</th></thead>';
    var i = 0;
    while (i < authors.length) {
      tag += `<tr>
      <td>${sanitizeHtml(authors[i].name)}</td>
      <td>${sanitizeHtml(authors[i].profile)}</td>
      <td><a href="/author/update?id=${authors[i].id}">Update</a></td>
      <td>
        <form action="/author/delete_process" method="post">
          <input type="hidden" name="id" value="${authors[i].id}">
          <input type="submit" value="Delete"> 
        </form>
      </td>
      </tr>
      `;
      i++;
    }
    tag += '</table>';
    return tag;
  },
};
