import Story from '../story/_slug.vue'
import UIStoryListWithHeading from '~/components/UIStoryListWithHeading.vue'

import createWrapperHelper from '~/test/helpers/createWrapperHelper'
import { SITE_TITLE, SITE_DESCRIPTION, SITE_URL } from '~/constants/index'

const createWrapper = createWrapperHelper({
  computed: {
    isDesktopWidth: () => true,
  },
  stubs: ['ClientOnly'],
})

describe('latest list', () => {
  test('open when viewport >= lg', () => {
    const wrapper = createWrapper(Story)

    expect(wrapper.find('.story__list--latest').exists()).toBe(true)
  })

  test('close when viewport < lg', () => {
    const wrapper = createWrapper(Story, {
      computed: {
        isDesktopWidth: () => false,
      },
    })

    expect(wrapper.find('.story__list--latest').exists()).toBe(false)
  })

  test('open UIStoryListWithHeading when latest stories are loaded', () => {
    const wrapper = createWrapper(Story, {
      data() {
        return {
          latestStories: [{}],
        }
      },
    })

    expect(
      wrapper
        .get('.story__list--latest')
        .findComponent(UIStoryListWithHeading)
        .exists()
    ).toBe(true)
  })

  test('close UIStoryListWithHeading when latest stories are not loaded', () => {
    const wrapper = createWrapper(Story)

    expect(
      wrapper
        .get('.story__list--latest')
        .findComponent(UIStoryListWithHeading)
        .exists()
    ).toBe(false)
  })

  test('render the proper latest stories', async () => {
    const mockStorySlug = '20201007fin003'
    const mockLatestStoryWithCurrentStorySlug = { slug: mockStorySlug }
    const mockLatestStories = [
      mockLatestStoryWithCurrentStorySlug,
      ...Array(8).fill({}),
    ]
    const wrapper = createWrapper(Story, {
      mocks: {
        $route: { params: { slug: mockStorySlug } },
        $fetchList: () => Promise.resolve({ items: mockLatestStories }),
      },
    })

    const latestList = wrapper.get('.story__list--latest')
    latestList.vm.$emit('show')
    await wrapper.vm.$nextTick()

    const { items } = latestList.findComponent(UIStoryListWithHeading).props()

    expect(items).toHaveLength(6)
    expect(items).not.toContainEqual(mockLatestStoryWithCurrentStorySlug)
  })

  /**
   * 由於 UIStoryListWithHeading 的內容是需要打 API 取得，又沒 SSR，所以內容一開始會是空的
   * 其底下的元件因此會往上擠，出現在視埠（viewport）之中，導致這些應該被 lazy load 的元件，在一開始就被載入進來
   * 為了避免這個問題，需要在一開始元件還沒內容時，就給它一個固定高度 100vh，以確保其底下的元件不會出現在視埠之中
   * 直到元件有內容後，再拿掉固定高度，讓其底下元件達到 lazy load 的效果
   */
  test('has height 100vh when latest stories are not loaded', async () => {
    const wrapper = createWrapper(Story)
    const latestList = wrapper.get('.story__list--latest')

    expect(latestList.element.style.height).toBe('100vh')

    await wrapper.setData({ latestStories: [{}] })

    expect(latestList.element.style.height).toBe('')
  })
})

describe('JSON-LD', () => {
  const storyMockRequired = {
    publishedDate: 'Tue, 13 Oct 2020 08:59:35 GMT',
    updatedAt: 'Tue, 13 Oct 2020 08:59:36 GMT',
  }
  const routeMock = {
    path: '/story/20201013edi033/',
    params: { slug: '20201013edi033' },
  }

  test('render the proper content in most cases', () => {
    const storyMock = {
      title: '蔡英文視察樂山雷達站',
      ogDescription: '近期共軍頻繁擾台',
      ogImage: {
        image: {
          resizedTargets: {
            mobile: {
              url:
                'https://www.mirrormedia.com.tw/assets/images/20201013164229-0272e9dd58d7935dfa1d4aa1cb9dcf4a-mobile.jpg',
            },
          },
        },
      },
      writers: [{ name: '謝文哲', id: '5cf77f941b66ac1100159d2b' }],
      sections: [{ title: '時事、生活', name: 'news' }],
      ...storyMockRequired,
    }

    const wrapper = createWrapper(Story, {
      data() {
        return {
          story: storyMock,
        }
      },
      mocks: {
        $route: routeMock,
      },
    })

    const {
      title,
      ogDescription,
      ogImage,
      publishedDate,
      updatedAt,
      writers,
      sections,
    } = storyMock
    const pageUrl = `${SITE_URL}${routeMock.path}`
    const imgUrl = ogImage.image.resizedTargets.mobile.url
    const logoUrl = `${SITE_URL}/logo.png`
    const { name: writerName, id: writerId } = writers[0]
    const { title: sectionTitle, name: sectionName } = sections[0]

    const { script } = wrapper.vm.$options.head.call(wrapper.vm)

    expect(findJsonLdByType(script, 'NewsArticle')).toEqual({
      type: 'application/ld+json',
      json: {
        '@context': 'https://schema.org/',
        '@type': 'NewsArticle',
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': pageUrl,
        },
        headline: title,
        image: imgUrl,
        datePublished: new Date(publishedDate).toISOString(),
        dateModified: new Date(updatedAt).toISOString(),
        author: {
          '@type': 'Person',
          name: writerName,
        },
        publisher: {
          '@type': 'Organization',
          name: SITE_TITLE,
          logo: {
            '@type': 'ImageObject',
            url: logoUrl,
          },
        },
        description: ogDescription,
        url: pageUrl,
        thumbnailUrl: imgUrl,
        articleSection: sectionTitle,
      },
    })

    expect(findJsonLdByType(script, 'Person')).toEqual({
      type: 'application/ld+json',
      json: {
        '@context': 'http://schema.org/',
        '@type': 'Person',
        name: writerName,
        url: `${SITE_URL}/author/${writerId}/`,
        brand: {
          '@type': 'Brand',
          name: SITE_TITLE,
          url: SITE_URL,
          image: logoUrl,
          logo: logoUrl,
          description: SITE_DESCRIPTION,
        },
      },
    })

    expect(findJsonLdByType(script, 'BreadcrumbList')).toEqual({
      type: 'application/ld+json',
      json: {
        '@context': 'http://schema.org/',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: SITE_TITLE,
            item: SITE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: sectionTitle,
            item: `${SITE_URL}/section/${sectionName}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: title,
            item: pageUrl,
          },
        ],
      },
    })
  })

  test('change the @type NewsArticle author when the story does not has a writer', () => {
    applyTestWithMinimalSetting((script) => {
      expect(findJsonLdByType(script, 'NewsArticle').json.author).toEqual({
        '@type': 'Organization',
        name: '鏡週刊',
      })
    })
  })

  test('@type NewsArticle articleSection is undefined when the story does not has a section title', () => {
    applyTestWithMinimalSetting((script) => {
      expect(
        findJsonLdByType(script, 'NewsArticle').json.articleSection
      ).toBeUndefined()
    })
  })

  test('@type Person is omitted when the story does not has a writer', () => {
    applyTestWithMinimalSetting((script) => {
      expect(findJsonLdByType(script, 'Person')).toBeUndefined()
    })
  })

  function applyTestWithMinimalSetting(expectFn) {
    const wrapper = createWrapper(Story, {
      data() {
        return {
          story: storyMockRequired,
        }
      },
      mocks: {
        $route: routeMock,
      },
    })

    expectFn(wrapper.vm.$options.head.call(wrapper.vm).script)
  }

  function findJsonLdByType(scripts = [], type) {
    return scripts.find((script) => script.json?.['@type'] === type)
  }
})