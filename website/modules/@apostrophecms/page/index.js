/*
 * This configures the @apostrophecms/page module to add a "home" page type to the
 * pages menu
 */

const fetch = require('node-fetch');

module.exports = {
  options: {
    types: [
      {
        name: 'default-page',
        label: 'Default',
      },
      {
        name: '@apostrophecms/home-page',
        label: 'Home',
      },
      {
        name: 'case-studies-page',
        label: 'Case Studies Page',
      },
    ],
    park: [
      {
        parkedId: 'caseParkedId',
        type: 'case-studies-page',
        _defaults: {
          slug: '/cases',
          title: 'Case Studies',
        },
      },
    ],
  },
  handlers(self) {
    return {
      'notFound': {
        async checkLandingPages(req) {
          // Only check if response hasn't been sent yet
          if (req.res.headersSent) {
            return;
          }
          
          try {
            // Get the landing pages module
            const landingPages = self.apos.modules['landing-pages'];
            if (!landingPages) {
              return;
            }
            
            // Extract slug from the path (remove leading slash)
            const slug = req.url.substring(1).split('?')[0];
            
            if (!slug) {
              return;
            }
            
            // Try to find a landing page with this slug
            const landingPage = await landingPages.find(req, { slug }).toObject();
            
            if (!landingPage || !landingPage.externalUrl) {
              return;
            }
            
            // TEST MODE: Just output the link
            const html = `
              <!DOCTYPE html>
              <html>
                <head>
                  <title>${landingPage.title}</title>
                </head>
                <body>
                  <h1>Landing Page: ${landingPage.title}</h1>
                  <p>Slug: ${landingPage.slug}</p>
                  <p>External URL: <a href="${landingPage.externalUrl}" target="_blank">${landingPage.externalUrl}</a></p>
                </body>
              </html>
            `;
            
            // Send the test HTML
            req.res.set('Content-Type', 'text/html');
            req.res.send(html);
            
            // Mark as handled
            req.notFound = false;
            
          } catch (error) {
            self.apos.util.error('Error checking landing pages:', error);
            // Don't send error response, let normal 404 handle it
          }
        }
      }
    };
  }
};
