const stripHtml = (html) => {
  if (typeof html !== 'string') return '';
  let temp = html;
  while (temp.includes('<p') || temp.includes('<span')) {
    const startP = temp.indexOf('<p');
    const startSpan = temp.indexOf('<span');
    let start = -1;
    if (startP !== -1 && (startSpan === -1 || startP < startSpan)) {
      start = startP;
    } else if (startSpan !== -1) {
      start = startSpan;
    }
    if (start === -1) break;
    const end = temp.indexOf('>', start);
    if (end === -1) break;
    temp = temp.slice(0, start) + temp.slice(end + 1);
  }
  temp = temp.replaceAll('</p>', '').replaceAll('</span>', '');
  return temp;
};

const areaToString = (areaData) => {
  if (typeof areaData === 'string') return stripHtml(areaData);
  if (areaData && areaData.items && areaData.items.length > 0) {
    return areaData.items
      .map(function (item) {
        if (typeof item.content === 'string') {
          return stripHtml(item.content);
        }
        return '';
      })
      .join(' ')
      .trim();
  }
  return '';
};

const updateTestimonialFeedback = async function (collection, doc, idKey) {
  if (
    typeof doc.feedback !== 'string' &&
    doc.feedback &&
    typeof doc.feedback === 'object'
  ) {
    const fixedFeedback = areaToString(doc.feedback);
    if (typeof fixedFeedback === 'string' && fixedFeedback !== doc.feedback) {
      await collection.updateOne(
        { [idKey]: doc[idKey] },
        { $set: { feedback: fixedFeedback } },
      );
      return 1;
    }
  }
  return 0;
};

const updateTableRowsDescriptions = async (collection, doc, idKey) => {
  let changed = false;
  if (doc.main?.items && Array.isArray(doc.main.items)) {
    const newItems = doc.main.items.map((widget) => {
      if (widget.type === 'table' && Array.isArray(widget.rows)) {
        const newRows = widget.rows.map((row) => {
          if (
            row &&
            typeof row.description === 'object' &&
            row.description !== null &&
            row.description.items
          ) {
            changed = true;
            return { ...row, description: areaToString(row.description) };
          }
          return row;
        });
        return { ...widget, rows: newRows };
      }
      return widget;
    });
    if (changed) {
      await collection.updateOne(
        { [idKey]: doc[idKey] },
        { $set: { 'main.items': newItems } },
      );
      return 1;
    }
  }
  return 0;
};

module.exports = {
  stripHtml,
  areaToString,
  updateTestimonialFeedback,
  updateTableRowsDescriptions,
};
