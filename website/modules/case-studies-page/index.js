const mainWidgets = require('../../lib/mainWidgets');

// Helper utility functions
const tagCountHelpers = {
  createTagMap(casesTags, log) {
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

        self.apos.util.log(
          'Tag counts calculated:',
          JSON.stringify(tagCounts, null, 2),
        );

        self.apos.util.log(
          'Filter data:',
          JSON.stringify(
            {
              piecesFilters: req.data.piecesFilters,
              query: req.query,
            },
            null,
            2,
          ),
        );
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

  tagCountsMethods: {
    processCaseStudiesForTags(caseStudies, tagMap, tagCounts, log) {
      caseStudies.forEach((study) => {
        tagCountHelpers.logFirstCaseStudy(caseStudies, study, log);
        this.countTagsForStudy(study, tagMap, tagCounts);
      });
    },

    countTagsForStudy(study, tagMap, tagCounts) {
      tagCountHelpers.countTagsOfType(
        study.industryIds,
        tagMap,
        tagCounts.industry,
      );

      tagCountHelpers.countTagsOfType(study.stackIds, tagMap, tagCounts.stack);

      tagCountHelpers.countTagsOfType(
        study.caseStudyTypeIds,
        tagMap,
        tagCounts.caseStudyType,
      );
    },
  },

  methods(self) {
    Object.assign(self, self.tagCountsMethods);

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
            self.apos.util.log.bind(self.apos.util),
          );

        const tagMap = tagCountHelpers.createTagMap(
          casesTags,
          self.apos.util.log.bind(self.apos.util),
        );

        self.processCaseStudiesForTags(
          caseStudies,
          tagMap,
          tagCounts,
          self.apos.util.log.bind(self.apos.util),
        );

        return tagCounts;
      },
    };
  },
};
