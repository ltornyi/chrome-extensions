const addAttrValueRow = (tableBody, attr, val) => {
  const newRow = tableBody.insertRow();
  const attrCell = newRow.insertCell();
  const valCell = newRow.insertCell();
  const attrText = document.createTextNode(attr);
  const valText = document.createTextNode(val);
  attrCell.appendChild(attrText);
  valCell.appendChild(valText);
}
const displayElements = (data) => {
  const tableBody = document.getElementById('datatable').getElementsByTagName('tbody')[0];
  for (const attr in data) {
    addAttrValueRow(tableBody, attr, data[attr]);
  }
}

const onPopupLoaded = () => {
  chrome.storage.local.get(
    [
      'score','rating','timestamp',
      'previous_close','previous_1_week',
      'previous_1_month','previous_1_year'
    ],
    (result) => displayElements(result)
  )
}

document.addEventListener('DOMContentLoaded', onPopupLoaded);