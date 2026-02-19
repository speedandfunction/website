/**
 * TagCountService - Single Responsibility: Tag counting and management
 *
 * Handles all operations related to counting and processing case study tags.
 * This service is responsible for:
 * - Creating tag maps from tag data
 * - Counting tags by type (industry, stack, case study type)
 * - Fetching and processing case studies and tags data
 */
class TagCountService {
  /**
   * Creates a mapping from tag IDs to tag slugs
   * @param {Array} casesTags - Array of tag objects
   * @returns {Object} Map of tag ID to slug
   */
  static createTagMap(casesTags) {
    const tagMap = {};
    casesTags.forEach((tag) => {
      tagMap[tag.aposDocId] = tag.slug;
    });
    return tagMap;
  }

  /**
   * Creates a mapping from partner IDs to partner slugs
   * @param {Array} businessPartners - Array of partner objects
   * @returns {Object} Map of partner ID to slug
   */
  static createPartnerMap(businessPartners) {
    const partnerMap = {};
    businessPartners.forEach((partner) => {
      partnerMap[partner.aposDocId] = partner.slug;
    });
    return partnerMap;
  }

  /**
   * Counts tags of a specific type and updates the counts object
   * @param {Array} tagIds - Array of tag IDs to count
   * @param {Object} tagMap - Map of tag ID to slug
   * @param {Object} countsForType - Object to store counts for this type
   */
  static countTagsOfType(tagIds, tagMap, countsForType) {
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
  }

  /**
   * Fetches case studies and tags data from the database
   * @param {Object} req - ApostropheCMS request object
   * @param {Object} aposModules - ApostropheCMS modules
   * @param {Object} options - Module options
   * @returns {Promise<Array>} Promise resolving to [caseStudies, casesTags, businessPartners] arrays
   */
  static async fetchCaseStudiesAndTags(req, aposModules, options) {
    const caseStudies = await aposModules[options.pieces].find(req).toArray();
    const casesTags = await aposModules['cases-tags'].find(req).toArray();
    const businessPartners = await aposModules['business-partner']
      .find(req)
      .toArray();
    return [caseStudies, casesTags, businessPartners];
  }

  /**
   * Processes case studies to count tags by type
   * @param {Array} caseStudies - Array of case study objects
   * @param {Object} tagMap - Map of tag ID to slug
   * @param {Object} partnerMap - Map of partner ID to slug
   * @param {Object} tagCounts - Object to store all tag counts
   */
  static processCaseStudies(caseStudies, tagMap, partnerMap, tagCounts) {
    caseStudies.forEach((study) => {
      TagCountService.countTagsOfType(
        study.industryIds,
        tagMap,
        tagCounts.industry,
      );

      TagCountService.countTagsOfType(study.stackIds, tagMap, tagCounts.stack);

      TagCountService.countTagsOfType(
        study.caseStudyTypeIds,
        tagMap,
        tagCounts.caseStudyType,
      );

      TagCountService.countTagsOfType(
        study.partnerIds,
        partnerMap,
        tagCounts.partner,
      );
    });
  }

  /**
   * Calculates tag counts for case studies
   * @param {Object} req - ApostropheCMS request object
   * @param {Object} aposModules - ApostropheCMS modules
   * @param {Object} options - Module options
   * @returns {Promise<Object>} Tag counts by type
   */
  static async calculateTagCounts(req, aposModules, options) {
    const tagCounts = {
      industry: {},
      stack: {},
      caseStudyType: {},
      partner: {},
    };

    const [caseStudies, casesTags, businessPartners] =
      await TagCountService.fetchCaseStudiesAndTags(req, aposModules, options);

    const tagMap = TagCountService.createTagMap(casesTags);
    const partnerMap = TagCountService.createPartnerMap(businessPartners);

    TagCountService.processCaseStudies(
      caseStudies,
      tagMap,
      partnerMap,
      tagCounts,
    );

    return tagCounts;
  }
}

module.exports = TagCountService;
