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

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
    jest.useRealTimers();
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
      ok: true,
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
      ok: true,
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

  it('should retry loading on error', async () => {
    global.fetch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<div class="cs_card">Card 1</div>'),
      });

    require('./infinite-scroll');

    const callback = mockIntersectionObserver.mock.calls[0][0];
    await callback([{ isIntersecting: true }]);

    jest.advanceTimersByTime(1000);
    await Promise.resolve();

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should show error message after max retries', async () => {
    global.fetch.mockRejectedValue(new Error('Network error'));

    require('./infinite-scroll');

    const callback = mockIntersectionObserver.mock.calls[0][0];

    for (let i = 0; i < 3; i++) {
      await callback([{ isIntersecting: true }]);
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
    }

    const errorMessage = document.querySelector(
      'div[style*="text-align: center"]',
    );
    expect(errorMessage).toBeTruthy();
    expect(errorMessage.textContent).toBe(
      'Unable to load more case studies. Please refresh the page to try again.',
    );
    expect(mockUnobserve).toHaveBeenCalled();
  });

  it('should handle non-ok response status', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    require('./infinite-scroll');

    const callback = mockIntersectionObserver.mock.calls[0][0];
    await callback([{ isIntersecting: true }]);

    jest.advanceTimersByTime(1000);
    await Promise.resolve();

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
