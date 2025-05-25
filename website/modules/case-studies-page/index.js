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
    if (!tagIds?.length) {
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

  processCaseStudies(caseStudies, tagMap, tagCounts) {
    caseStudies.forEach((study) => {
      this.countTagsOfType(study.industryIds, tagMap, tagCounts.industry);

      this.countTagsOfType(study.stackIds, tagMap, tagCounts.stack);

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
      async calculateTagCounts(req) {
        const tagCounts = {
          industry: {},
          stack: {},
          caseStudyType: {},
        };

        const [caseStudies, casesTags] =
          await tagCountHelpers.fetchCaseStudiesAndTags(
            req,
            self.apos.modules,
            self.options,
          );

        const tagMap = tagCountHelpers.createTagMap(casesTags);

        tagCountHelpers.processCaseStudies(caseStudies, tagMap, tagCounts);

        return tagCounts;
      },
    };
  },
};
