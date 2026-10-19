const healthModule = require('./index');

describe('health module', () => {
  test('defines routes method', () => {
    expect(typeof healthModule.routes).toBe('function');
  });

  test('handles /healthz with 200 OK', () => {
    const routes = healthModule.routes();
    const res = {
      status: jest.fn().mockReturnThis(),
      type: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    const req = {};

    routes.get['/healthz'](req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.type).toHaveBeenCalledWith('text/plain');
    expect(res.send).toHaveBeenCalledWith('OK');
  });

  test('handles /health with 200 OK', () => {
    const routes = healthModule.routes();
    const res = {
      status: jest.fn().mockReturnThis(),
      type: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    const req = {};

    routes.get['/health'](req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.type).toHaveBeenCalledWith('text/plain');
    expect(res.send).toHaveBeenCalledWith('OK');
  });
});
