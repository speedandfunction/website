# Case Studies Filter Configuration

## Default Visible Tags Count

Configuration for the number of tags displayed before the "Show more" button appears.

### Configuration Location

**File:** `modules/case-studies-page/index.js`

```javascript
const DEFAULT_VISIBLE_TAGS_COUNT = 5;
```

### Data Flow

1. **Backend** → HTML template via `data.defaultVisibleTagsCount`
2. **HTML** → Frontend via `data-default-visible-tags` attribute
3. **Frontend JavaScript** → Reads from data attribute and sets `window.DEFAULT_VISIBLE_TAGS_COUNT`
4. **Filter Handler** → Uses global variable for show/hide logic

### Implementation

- **HTML Template**: Uses `data.defaultVisibleTagsCount` in conditional logic
- **JavaScript**: Reads configuration via `initConfiguration()` function
- **Button Visibility**: Automatically controlled based on tag count vs configured limit
