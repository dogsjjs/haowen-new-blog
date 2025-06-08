// src/data/blogPosts.ts

export interface PostDetail {
  id: string;
  title: string;
  date: Date;
  imageUrl: string;
  categories: string[];
  tags: string[];
  content: string; // HTML content or Markdown content if you parse it in the component
}

const posts: PostDetail[] = [
  {
    id: 'my-first-post',
    title: '探索Vue 3 Composition API的奥秘',
    date: new Date(2023, 9, 25, 10, 30), // Month is 0-indexed, so 9 is October
    imageUrl: 'https://picsum.photos/seed/vue3post/1920/1080',
    categories: ['技术', '前端框架'],
    tags: ['Vue 3', 'Composition API', 'JavaScript', 'Web开发'],
    content: `
      <p>Vue 3 的 Composition API 为我们带来了全新的组件逻辑组织方式。与 Vue 2 的 Options API 不同，Composition API 允许我们根据逻辑功能来组织代码，而不是按照选项（data, methods, computed等）来分散它们。</p>
      <h2>主要优势</h2>
      <ul>
        <li><strong>更好的逻辑复用:</strong> 通过将相关逻辑提取到自定义 Hooks (Composables) 中，可以在多个组件之间轻松共享。</li>
        <li><strong>更灵活的代码组织:</strong> 大型组件的代码不再受限于 Options API 的结构，可以更清晰地按功能分组。</li>
        <li><strong>更好的类型推断:</strong> 对于 TypeScript 用户来说，Composition API 提供了更友好的类型支持。</li>
      </ul>
      <p>例如，我们可以创建一个 <code>useMousePosition</code> 的 Composable 来追踪鼠标位置：</p>
      <pre><code class="language-javascript">
import { ref, onMounted, onUnmounted } from 'vue';

export function useMousePosition() {
  const x = ref(0);
  const y = ref(0);

  function update(event) {
    x.value = event.pageX;
    y.value = event.pageY;
  }

  onMounted(() => window.addEventListener('mousemove', update));
  onUnmounted(() => window.removeEventListener('mousemove', update));

  return { x, y };
}
      </code></pre>
      <p>然后在组件中使用它：</p>
      <pre><code class="language-javascript">
import { useMousePosition } from './useMousePosition';

export default {
  setup() {
    const { x, y } = useMousePosition();
    return { x, y };
  }
}
      </code></pre>
      <h2>总结</h2>
      <p>Composition API 无疑是 Vue 3 中最令人兴奋的特性之一。它不仅解决了 Options API 在大型项目中可能遇到的一些问题，还为代码的组织和复用提供了更强大的工具。虽然初学时可能需要一些时间来适应新的思维方式，但一旦掌握，它将极大地提升开发效率和代码质量。</p>
      <blockquote>“学习 Composition API 是拥抱现代 Vue 开发的关键一步。”</blockquote>
      <p>希望这篇文章能帮助你更好地理解和使用 Composition API。</p>
    `,
  },
  {
    id: 'another-post',
    title: 'Markdown 与代码高亮入门',
    date: new Date(2023, 10, 15, 14, 0), // November
    imageUrl: 'https://picsum.photos/seed/markdown/1920/1080',
    categories: ['技术', '工具'],
    tags: ['Markdown', 'highlight.js', 'marked'],
    content: `
      <p>Markdown 是一种轻量级标记语言，它允许人们使用易读易写的纯文本格式编写文档，然后转换成有效的XHTML（或者HTML）文档。</p>
      <h2>为什么使用 Markdown?</h2>
      <ul>
        <li><strong>纯文本:</strong> 易于读写，版本控制友好。</li>
        <li><strong>专注内容:</strong> 无需关心复杂的排版。</li>
        <li><strong>广泛支持:</strong> 许多平台和工具都支持 Markdown。</li>
      </ul>
      <p>结合 <code>marked.js</code> 可以将 Markdown 转换为 HTML，再配合 <code>highlight.js</code> 可以实现代码块的语法高亮。</p>
      <pre><code class="language-javascript">
// 示例：使用 marked 和 highlight.js
import { Marked } from 'marked';
import hljs from 'highlight.js';

const markedInstance = new Marked({
  highlight: (code, lang) => {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  }
});

const markdownString = "## Hello\\n\`\`\`js\\nconsole.log(\\"Hello World\\");\\n\`\`\`";
const htmlOutput = markedInstance.parse(markdownString);
console.log(htmlOutput);
      </code></pre>
      <p>这使得在博客或文档中展示代码变得非常方便和美观。</p>
    `
  }
  // 你可以在这里添加更多的博客文章对象
];

/**
 * 根据 ID 获取博客文章详情。
 * 在实际应用中，你可能会从 API 获取数据。
 * @param id 文章的 ID
 * @returns PostDetail | undefined
 */
export const getPostById = (id: string): Promise<PostDetail | undefined> => {
  return new Promise((resolve) => {
    // 模拟异步获取
    setTimeout(() => {
      const post = posts.find(p => p.id === id);
      resolve(post);
    }, 300); // 模拟网络延迟
  });
};

/**
 * 获取所有博客文章的摘要列表（如果需要列表页）。
 * @returns PostDetail[]
 */
export const getAllPosts = (): Promise<PostDetail[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(posts);
    }, 300);
  });
};
