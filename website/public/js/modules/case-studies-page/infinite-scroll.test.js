describe('Infinite Scroll', () => {
  let mockIntersectionObserver;
  let mockObserve;
  let mockUnobserve;
  let mockDisconnect;

  beforeEach(() => {
    // Mock IntersectionObserver
    mockObserve = jest.fn();
    mockUnobserve = jest.fn();
    mockDisconnect = jest.fn();
    mockIntersectionObserver = jest.fn();
    mockIntersectionObserver.mockImplementation((callback) => ({
      observe: mockObserve,
      unobserve: mockUnobserve,
      disconnect: mockDisconnect,
    }));
    window.IntersectionObserver = mockIntersectionObserver;

    // Mock fetch
    global.fetch = jest.fn();

    // Mock DOM elements
    document.body.innerHTML = `
            <div id="case-studies-grid"></div>
            <div id="infinite-scroll-trigger"></div>
        `;

    // Mock window.totalPages
    window.totalPages = 3;
  });

  afterEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  it('should initialize IntersectionObserver when elements exist', () => {
    require('./infinite-scroll');
    expect(mockIntersectionObserver).toHaveBeenCalled();
    expect(mockObserve).toHaveBeenCalledWith(
      document.getElementById('infinite-scroll-trigger'),
    );
  });

  it('should not initialize when trigger element is missing', () => {
    document.getElementById('infinite-scroll-trigger').remove();
    require('./infinite-scroll');
    expect(mockIntersectionObserver).not.toHaveBeenCalled();
  });

  it('should not initialize when grid element is missing', () => {
    document.getElementById('case-studies-grid').remove();
    require('./infinite-scroll');
    expect(mockIntersectionObserver).not.toHaveBeenCalled();
  });

  it('should load more content when trigger is intersected', async () => {
    const mockHtml = `
            <div class="cs_card">Card 1</div>
            <div class="cs_card">Card 2</div>
        `;
    global.fetch.mockResolvedValueOnce({
      text: () => Promise.resolve(mockHtml),
    });

    require('./infinite-scroll');

    // Simulate intersection
    const callback = mockIntersectionObserver.mock.calls[0][0];
    await callback([{ isIntersecting: true }]);

    expect(global.fetch).toHaveBeenCalled();
    expect(document.querySelectorAll('.cs_card').length).toBe(2);
  });

  it('should not load more content when already loading', async () => {
    global.fetch.mockImplementationOnce(() => new Promise(() => {})); // Never resolves

    require('./infinite-scroll');

    // Simulate intersection twice
    const callback = mockIntersectionObserver.mock.calls[0][0];
    await callback([{ isIntersecting: true }]);
    await callback([{ isIntersecting: true }]);

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should stop observing when all pages are loaded', async () => {
    window.totalPages = 1;
    const mockHtml = '<div class="cs_card">Card 1</div>';
    global.fetch.mockResolvedValueOnce({
      text: () => Promise.resolve(mockHtml),
    });

    require('./infinite-scroll');

    // Simulate intersection
    const callback = mockIntersectionObserver.mock.calls[0][0];
    await callback([{ isIntersecting: true }]);

    expect(mockUnobserve).toHaveBeenCalledWith(
      document.getElementById('infinite-scroll-trigger'),
    );
  });

  it('should handle fetch errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    require('./infinite-scroll');

    // Simulate intersection
    const callback = mockIntersectionObserver.mock.calls[0][0];
    await callback([{ isIntersecting: true }]);

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error loading more case studies:',
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });
});
