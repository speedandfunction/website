const mainWidgets = require('../../lib/mainWidgets');

// Helper utility functions for tag counting
const tagCountHelpers = {
  createTagMap(casesTags) {
    const tagMap = {};
    casesTags.forEach((tag) => {
      tagMap[tag.aposDocId] = tag.slug;
    });
    return tagMap;
  },

  countTagsOfType(tagIds, tagMap, countsForType) {
    if (!tagIds || !tagIds.length) {
      return;
    }
    tagIds.forEach((tagId) => {
      const tagSlug = tagMap[tagId];
      if (tagSlug && !countsForType[tagSlug]) {
        countsForType[tagSlug] = 0;
      }
      if (tagSlug) {
        countsForType[tagSlug] += 1;
      }
    });
  },

  async fetchCaseStudiesAndTags(req, aposModules, options) {
    const caseStudies = await aposModules[options.pieces].find(req).toArray();
    const casesTags = await aposModules['cases-tags'].find(req).toArray();
    return [caseStudies, casesTags];
  },

  // Process case studies to count tags
  processCaseStudies(caseStudies, tagMap, tagCounts) {
    caseStudies.forEach((study) => {
      // Count industry tags
      this.countTagsOfType(study.industryIds, tagMap, tagCounts.industry);

      // Count stack tags
      this.countTagsOfType(study.stackIds, tagMap, tagCounts.stack);

      // Count case study type tags
      this.countTagsOfType(
        study.caseStudyTypeIds,
        tagMap,
        tagCounts.caseStudyType,
      );
    });
  },
};

module.exports = {
  extend: '@apostrophecms/piece-page-type',
  options: {
    label: 'Case Studies Page',
    pluralLabel: 'Case Studies Pages',
    perPage: 6,
    piecesFilters: [
      { name: 'industry' },
      { name: 'stack' },
      { name: 'caseStudyType' },
    ],
    pieces: 'case-studies',
    piecesFiltersUrl: '/case-studies',
  },
  fields: {
    add: {
      main: {
        type: 'area',
        options: mainWidgets,
      },
    },
    group: {
      mainArea: {
        label: 'Main page content',
        fields: ['main'],
      },
    },
  },

  init(self) {
    // Add a hook to calculate tag counts before rendering the index page
    self.beforeIndex = async (req) => {
      try {
        const tagCounts = await self.calculateTagCounts(req);

        const reqCopy = req;
        if (!reqCopy.data) {
          reqCopy.data = {};
        }
        reqCopy.data.tagCounts = tagCounts;
      } catch (error) {
        self.apos.util.error('Error calculating tag counts:', error);

        const reqCopy = req;
        if (!reqCopy.data) {
          reqCopy.data = {};
        }
        reqCopy.data.tagCounts = {
          industry: {},
          stack: {},
          caseStudyType: {},
        };
      }
    };
  },

  methods(self) {
    return {
      // Calculate tag counts for the current request
      async calculateTagCounts(req) {
        // Initialize tag counts structure
        const tagCounts = {
          industry: {},
          stack: {},
          caseStudyType: {},
        };

        // Fetch case studies and tags
        const [caseStudies, casesTags] =
          await tagCountHelpers.fetchCaseStudiesAndTags(
            req,
            self.apos.modules,
            self.options,
          );

        // Create a map of tag IDs to slugs
        const tagMap = tagCountHelpers.createTagMap(casesTags);

        // Process case studies to count tags
        tagCountHelpers.processCaseStudies(caseStudies, tagMap, tagCounts);

        return tagCounts;
      },
    };
  },
};
