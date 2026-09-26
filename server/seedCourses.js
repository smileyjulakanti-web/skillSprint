const mongoose = require("mongoose");
const dns = require("dns");
require("dotenv").config();

try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch {
  // Ignore in restricted environments
}

const Course = require("./models/course");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/skillsprint";

const SAMPLE_COURSES = [
  {
    title: "Full Stack Web Development",
    description:
      "Master modern end-to-end web engineering. Build full-stack applications with HTML, CSS, JavaScript, React, Node.js, Express, and MongoDB.",
    category: "Web Development",
    level: "Beginner",
    instructor: "SkillSprint Team",
    thumbnail: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?auto=format&fit=crop&w=800&q=80",
    duration: "40 hours",
    totalLessons: 10,
    lessons: [
      {
        lessonNumber: 1,
        title: "HTML Basics",
        description: "Understand semantic markup, document tree structure, accessibility standards, and SEO tags.",
        duration: "35 mins",
        videoUrl: "https://www.youtube.com/embed/kUMe1FH4CHE",
        content: `### Welcome to HTML Basics\n\nHTML (HyperText Markup Language) is the backbone of the web. In this lesson, we cover:\n- Semantic tags (\`<header>\`, \`<nav>\`, \`<main>\`, \`<footer>\`)\n- Accessible attributes (\`aria-*\`, \`alt\` tags)\n- Form structures with modern validation.\n\n\`\`\`html\n<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <title>SkillSprint Web App</title>\n  </head>\n  <body>\n    <main>\n      <h1>Welcome to Full-Stack Engineering</h1>\n    </main>\n  </body>\n</html>\n\`\`\``,
        resources: [
          { title: "MDN HTML Documentation", url: "https://developer.mozilla.org/en-US/docs/Web/HTML" },
          { title: "HTML5 Semantic Cheatsheet", url: "https://html5doctor.com/" },
        ],
      },
      {
        lessonNumber: 2,
        title: "CSS Fundamentals",
        description: "Master CSS variables, Flexbox layouts, CSS Grid, and responsive media queries.",
        duration: "45 mins",
        videoUrl: "https://www.youtube.com/embed/1Rs2ND1ryYc",
        content: `### CSS Fundamentals & Layouts\n\nModern CSS provides powerful layout primitives without requiring heavyweight frameworks:\n- Flexbox for 1D alignments\n- CSS Grid for 2D responsive dashboards\n- Custom CSS custom properties (variables) for theme tokens.\n\n\`\`\`css\n.dashboard-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));\n  gap: 1.5rem;\n}\n\`\`\``,
        resources: [
          { title: "CSS Tricks: Flexbox Guide", url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/" },
          { title: "CSS Tricks: Grid Guide", url: "https://css-tricks.com/snippets/css/complete-guide-grid/" },
        ],
      },
      {
        lessonNumber: 3,
        title: "JavaScript Basics",
        description: "Variables, primitives, closures, arrow functions, and ES6+ modern JavaScript syntax.",
        duration: "50 mins",
        videoUrl: "https://www.youtube.com/embed/W6NZfCO5SIk",
        content: `### Modern JavaScript (ES6+)\n\nJavaScript is the programmable engine of the web. We cover:\n- \`let\` and \`const\` scope scoping\n- Arrow functions & Lexical \`this\`\n- Destructuring, spread, and rest operators\n- Array methods: \`map\`, \`filter\`, \`reduce\`.\n\n\`\`\`javascript\nconst users = [{ name: 'Alex', xp: 450 }, { name: 'Dev', xp: 720 }];\nconst topUsers = users.filter(u => u.xp > 500).map(u => u.name);\nconsole.log(topUsers); // ['Dev']\n\`\`\``,
        resources: [
          { title: "JavaScript.info", url: "https://javascript.info" },
        ],
      },
      {
        lessonNumber: 4,
        title: "JavaScript DOM",
        description: "Manipulating DOM elements, handling browser events, and optimizing event listeners.",
        duration: "40 mins",
        videoUrl: "https://www.youtube.com/embed/0ik6X4DJKCc",
        content: `### Working with the Browser DOM\n\nLearn how JavaScript interacts with the live document:\n- \`querySelector\` and \`querySelectorAll\`\n- Event listeners & event delegation\n- Modifying classes, attributes, and inner content safely without XSS vulnerabilities.`,
        resources: [
          { title: "DOM Enlightenment", url: "https://domenlightenment.com" },
        ],
      },
      {
        lessonNumber: 5,
        title: "React Fundamentals",
        description: "Component hierarchy, JSX syntax, props, and unidirectional data flow in React.",
        duration: "60 mins",
        videoUrl: "https://www.youtube.com/embed/bMknfKXIFA8",
        content: `### React Fundamentals\n\nReact organizes code into declarative UI components:\n- Function components and JSX syntax\n- Props for parent-to-child data flow\n- Pure components and rendering lifecycle.`,
        resources: [
          { title: "React Official Docs", url: "https://react.dev" },
        ],
      },
      {
        lessonNumber: 6,
        title: "React Hooks",
        description: "Master useState, useEffect, useMemo, useCallback, and building custom hooks.",
        duration: "55 mins",
        videoUrl: "https://www.youtube.com/embed/O6P86uwfdR0",
        content: `### Deep Dive into React Hooks\n\nHooks enable state and lifecycle logic in function components:\n- \`useState\` for reactive values\n- \`useEffect\` for side effects and cleanup timers/listeners\n- Custom reusable hooks for API fetching.\n\n\`\`\`jsx\nfunction useWindowWidth() {\n  const [width, setWidth] = useState(window.innerWidth);\n  useEffect(() => {\n    const onResize = () => setWidth(window.innerWidth);\n    window.addEventListener('resize', onResize);\n    return () => window.removeEventListener('resize', onResize);\n  }, []);\n  return width;\n}\n\`\`\``,
        resources: [
          { title: "Hooks API Reference", url: "https://react.dev/reference/react" },
        ],
      },
      {
        lessonNumber: 7,
        title: "Node.js Basics",
        description: "Asynchronous runtime, Event Loop, file system streams, and modular CommonJS/ESM architecture.",
        duration: "45 mins",
        videoUrl: "https://www.youtube.com/embed/TlB_eWDSMt4",
        content: `### Node.js Backend Fundamentals\n\nNode.js executes JavaScript outside the browser using the V8 engine:\n- Non-blocking I/O model and the Event Loop\n- Core modules: \`fs\`, \`path\`, \`http\`, \`crypto\`\n- Managing dependencies with npm and package.json.`,
        resources: [
          { title: "Node.js Documentation", url: "https://nodejs.org/docs" },
        ],
      },
      {
        lessonNumber: 8,
        title: "Express.js",
        description: "Build robust REST APIs with routing, middleware pipeline, request validation, and error handlers.",
        duration: "50 mins",
        videoUrl: "https://www.youtube.com/embed/7H_QH9nipNs",
        content: `### Building REST APIs with Express\n\nExpress is the de-facto web framework for Node.js:\n- Middleware architecture (\`cors\`, \`express.json\`)\n- Routing patterns (\`router.get\`, \`router.post\`)\n- Global error handling middleware.`,
        resources: [
          { title: "Express.js Guide", url: "https://expressjs.com" },
        ],
      },
      {
        lessonNumber: 9,
        title: "MongoDB",
        description: "NoSQL document database, schemas with Mongoose, indexes, aggregation, and querying.",
        duration: "55 mins",
        videoUrl: "https://www.youtube.com/embed/ofme2o29ngU",
        content: `### Persistent Storage with MongoDB & Mongoose\n\nMongoDB stores data in flexible JSON-like documents:\n- Defining Mongoose schemas with type validations\n- Query helpers: \`find\`, \`findOne\`, \`findOneAndUpdate\`\n- Indexing for high-performance lookups.`,
        resources: [
          { title: "Mongoose Documentation", url: "https://mongoosejs.com" },
        ],
      },
      {
        lessonNumber: 10,
        title: "Building a Full Stack Project",
        description: "Connect React frontend with Express backend, handle JWT tokens, and deploy the application.",
        duration: "90 mins",
        videoUrl: "https://www.youtube.com/embed/nu_pCVPKzTk",
        content: `### Capstone: End-to-End Production App\n\nBring all pieces together into a unified platform:\n- Axios interceptors for authenticated API requests\n- State management and protected routes\n- Production build optimization and deployment to cloud hosts.`,
        resources: [
          { title: "Full Stack Architecture Guide", url: "https://fullstackopen.com/en/" },
        ],
      },
    ],
  },
  {
    title: "Python Programming",
    description:
      "A complete journey into Python programming from foundational syntax to object-oriented architecture and practical automation projects.",
    category: "Programming",
    level: "Beginner",
    instructor: "SkillSprint Team",
    thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=800&q=80",
    duration: "30 hours",
    totalLessons: 10,
    lessons: [
      {
        lessonNumber: 1,
        title: "Python Introduction",
        description: "Installing Python, setting up virtual environments, and executing your first Python script.",
        duration: "25 mins",
        videoUrl: "https://www.youtube.com/embed/_uQrJ0TkZlc",
        content: `### Python Introduction\n\nPython is famous for its clean, readable syntax and versatile ecosystem. In this lesson, we set up our development environment and examine Python's interpreter.`,
        resources: [{ title: "Python Official Docs", url: "https://docs.python.org/3/" }],
      },
      {
        lessonNumber: 2,
        title: "Variables and Data Types",
        description: "Integers, floats, strings, booleans, and dynamic typing in Python.",
        duration: "30 mins",
        videoUrl: "https://www.youtube.com/embed/kqtD5dpn9C8",
        content: `### Data Types and Memory Model\n\nLearn how Python manages variables and types:\n\`\`\`python\nname = "SkillSprint"\nversion = 2.0\nis_active = True\nprint(f"{name} v{version} is running!")\n\`\`\``,
        resources: [{ title: "Python Types Guide", url: "https://realpython.com/python-data-types/" }],
      },
      {
        lessonNumber: 3,
        title: "Operators",
        description: "Arithmetic, comparison, logical, membership, and identity operators.",
        duration: "30 mins",
        videoUrl: "https://www.youtube.com/embed/v5MR5JnKcZI",
        content: `### Operators & Expressions\n\nMaster Python expressions and operator precedence:\n- Arithmetic: \`+\`, \`-\`, \`*\`, \`/\`, \`//\`, \`%\`, \`**\`\n- Comparison & Boolean logic (\`and\`, \`or\`, \`not\`).`,
        resources: [{ title: "Python Operators", url: "https://www.w3schools.com/python/python_operators.asp" }],
      },
      {
        lessonNumber: 4,
        title: "Conditions",
        description: "Conditional logic with if, elif, and else statements.",
        duration: "35 mins",
        videoUrl: "https://www.youtube.com/embed/DZwmZ8Usvnk",
        content: `### Control Flow with Conditions\n\nBranch code paths based on dynamic expressions:\n\`\`\`python\nscore = 88\nif score >= 90:\n    grade = 'A'\nelif score >= 80:\n    grade = 'B'\nelse:\n    grade = 'C'\n\`\`\``,
        resources: [{ title: "Real Python Conditionals", url: "https://realpython.com/python-conditional-statements/" }],
      },
      {
        lessonNumber: 5,
        title: "Loops",
        description: "Iterating with for and while loops, break, continue, and list comprehensions.",
        duration: "40 mins",
        videoUrl: "https://www.youtube.com/embed/6iF8Xb7Z3wQ",
        content: `### Loops and Iteration\n\nProcess sequences effectively with Pythonic loops:\n\`\`\`python\nskills = ["Python", "Docker", "React"]\nfor idx, skill in enumerate(skills, start=1):\n    print(f"{idx}. {skill}")\n\`\`\``,
        resources: [{ title: "Python Iteration", url: "https://realpython.com/python-for-loop/" }],
      },
      {
        lessonNumber: 6,
        title: "Functions",
        description: "Defining functions, default arguments, *args, **kwargs, and docstrings.",
        duration: "45 mins",
        videoUrl: "https://www.youtube.com/embed/9Os0o3wzS_I",
        content: `### Functions & Reusability\n\nWrite modular, reusable blocks of logic:\n\`\`\`python\ndef calculate_sprint_score(completed, total, xp_per_sprint=100):\n    ratio = completed / total if total > 0 else 0\n    return round(ratio * xp_per_sprint)\n\`\`\``,
        resources: [{ title: "Python Functions Guide", url: "https://docs.python.org/3/tutorial/controlflow.html#defining-functions" }],
      },
      {
        lessonNumber: 7,
        title: "Lists and Tuples",
        description: "Sequences, mutability, slicing, list methods, and immutable tuples.",
        duration: "40 mins",
        videoUrl: "https://www.youtube.com/embed/W8KRzm-HUcc",
        content: `### Lists and Tuples\n\n- Lists: mutable sequences with \`.append()\`, \`.pop()\`, and slice notation \`list[start:stop:step]\`\n- Tuples: fixed-size, immutable data structures for records.`,
        resources: [{ title: "Python Lists", url: "https://docs.python.org/3/tutorial/datastructures.html" }],
      },
      {
        lessonNumber: 8,
        title: "Dictionaries and Sets",
        description: "Key-value hashing with dictionaries and mathematical unique collections with sets.",
        duration: "40 mins",
        videoUrl: "https://www.youtube.com/embed/daefaLgNkw0",
        content: `### Dictionaries & Sets\n\nHigh-performance $O(1)$ lookups via hash maps:\n\`\`\`python\nsprint_stats = {\n    "title": "Python Basics",\n    "xp": 300,\n    "tags": {"backend", "scripting"}\n}\n\`\`\``,
        resources: [{ title: "Python Dictionaries", url: "https://realpython.com/python-dicts/" }],
      },
      {
        lessonNumber: 9,
        title: "OOP",
        description: "Classes, instances, inheritance, encapsulation, and dunder methods (__init__, __str__).",
        duration: "60 mins",
        videoUrl: "https://www.youtube.com/embed/JeznW_7DlB0",
        content: `### Object-Oriented Programming (OOP)\n\nModel real-world systems with classes:\n\`\`\`python\nclass SprintLearner:\n    def __init__(self, name, track):\n        self.name = name\n        self.track = track\n        self.completed_lessons = []\n\n    def complete(self, lesson_id):\n        self.completed_lessons.append(lesson_id)\n\`\`\``,
        resources: [{ title: "Python OOP Guide", url: "https://realpython.com/python3-object-oriented-programming/" }],
      },
      {
        lessonNumber: 10,
        title: "Mini Project",
        description: "Build an automated Command-Line Sprint Tracker with file persistence and JSON export.",
        duration: "75 mins",
        videoUrl: "https://www.youtube.com/embed/8ext9G7xspg",
        content: `### Capstone Mini Project\n\nBuild a CLI tool that tracks learning goals, saves user sessions to JSON, and computes progress metrics.`,
        resources: [{ title: "Python Project Ideas", url: "https://realpython.com/tutorials/projects/" }],
      },
    ],
  },
  {
    title: "Data Structures and Algorithms",
    description:
      "Ace technical interviews and write efficient code by mastering core algorithmic principles, time complexity analysis, and essential data structures.",
    category: "DSA",
    level: "Beginner",
    instructor: "SkillSprint Team",
    thumbnail: "https://images.unsplash.com/photo-1516116211227-bbc0429f55e3?auto=format&fit=crop&w=800&q=80",
    duration: "35 hours",
    totalLessons: 10,
    lessons: [
      {
        lessonNumber: 1,
        title: "Introduction to DSA",
        description: "Why data structures matter and how computational efficiency drives scalable systems.",
        duration: "30 mins",
        videoUrl: "https://www.youtube.com/embed/8hly31xKli0",
        content: `### Introduction to Data Structures & Algorithms\n\nLearn why understanding memory representation and algorithmic trade-offs separates senior engineers from juniors.`,
        resources: [{ title: "GeeksforGeeks DSA", url: "https://www.geeksforgeeks.org/learn-data-structures-and-algorithms-tutorial/" }],
      },
      {
        lessonNumber: 2,
        title: "Time Complexity",
        description: "Big-O notation, space complexity, asymptotic analysis, and common runtime classes.",
        duration: "45 mins",
        videoUrl: "https://www.youtube.com/embed/D6xkbGLQesk",
        content: `### Big-O & Complexity Analysis\n\nEvaluate algorithm scalability:\n- $O(1)$ Constant\n- $O(\\log N)$ Logarithmic\n- $O(N)$ Linear\n- $O(N \\log N)$ Linearithmic\n- $O(N^2)$ Quadratic`,
        resources: [{ title: "Big-O Cheatsheet", url: "https://www.bigocheatsheet.com/" }],
      },
      {
        lessonNumber: 3,
        title: "Arrays",
        description: "Contiguous memory layout, two-pointer techniques, and sliding window paradigms.",
        duration: "45 mins",
        videoUrl: "https://www.youtube.com/embed/pmN9ExVY3gQ",
        content: `### Arrays & Two-Pointer Techniques\n\nExplore array operations, cache locality, and common interview patterns like Two Pointers and Sliding Window.`,
        resources: [{ title: "Array Patterns", url: "https://leetcode.com/explore/featured/card/fun-with-arrays/" }],
      },
      {
        lessonNumber: 4,
        title: "Strings",
        description: "String immutability, pattern matching, anagrams, and palindromes.",
        duration: "40 mins",
        videoUrl: "https://www.youtube.com/embed/Wdjr6uoZblw",
        content: `### String Algorithms\n\nTechniques for frequency hashing, sub-sequence verification, and string transformations.`,
        resources: [{ title: "String Algorithms", url: "https://cp-algorithms.com/string/string-hashing.html" }],
      },
      {
        lessonNumber: 5,
        title: "Searching",
        description: "Linear search vs Binary search on sorted arrays, search in rotated arrays.",
        duration: "40 mins",
        videoUrl: "https://www.youtube.com/embed/P3YID7liBug",
        content: `### Binary Search Mastery\n\nAchieving $O(\\log N)$ lookup performance on sorted spaces.`,
        resources: [{ title: "Binary Search Guide", url: "https://leetcode.com/explore/learn/card/binary-search/" }],
      },
      {
        lessonNumber: 6,
        title: "Sorting",
        description: "Bubble sort, Insertion sort, Merge sort, and Quick sort implementation details.",
        duration: "60 mins",
        videoUrl: "https://www.youtube.com/embed/kPRA0W1kECg",
        content: `### Sorting Algorithms\n\nDivide-and-conquer strategies: Merge Sort ($O(N \\log N)$ stable) and Quick Sort.`,
        resources: [{ title: "Visualgo Sorting", url: "https://visualgo.net/en/sorting" }],
      },
      {
        lessonNumber: 7,
        title: "Linked Lists",
        description: "Singly linked, doubly linked lists, pointer reversal, and cycle detection.",
        duration: "50 mins",
        videoUrl: "https://www.youtube.com/embed/Hj_rA0dhr2I",
        content: `### Linked Lists & Pointer Manipulation\n\nNode structures, fast & slow pointer (Floyd's Cycle Finding), and reversing in-place.`,
        resources: [{ title: "Linked List Guide", url: "https://leetcode.com/explore/learn/card/linked-list/" }],
      },
      {
        lessonNumber: 8,
        title: "Stacks",
        description: "LIFO architecture, parentheses validation, and Monotonic Stack applications.",
        duration: "45 mins",
        videoUrl: "https://www.youtube.com/embed/I5lq6sCuABE",
        content: `### Stacks (Last In, First Out)\n\nPractical applications including balanced parentheses, recursion call-stacks, and expression evaluation.`,
        resources: [{ title: "Stack Data Structure", url: "https://en.wikipedia.org/wiki/Stack_(abstract_data_type)" }],
      },
      {
        lessonNumber: 9,
        title: "Queues",
        description: "FIFO architecture, circular queues, deques, and breadth-first search queues.",
        duration: "40 mins",
        videoUrl: "https://www.youtube.com/embed/D6gu-_tm9g8",
        content: `### Queues (First In, First Out)\n\nBuffer processing, task schedulers, and breadth-first search frontier management.`,
        resources: [{ title: "Queue Implementations", url: "https://www.geeksforgeeks.org/queue-data-structure/" }],
      },
      {
        lessonNumber: 10,
        title: "Trees",
        description: "Binary Trees, Binary Search Trees (BST), inorder/preorder/postorder traversals.",
        duration: "70 mins",
        videoUrl: "https://www.youtube.com/embed/oSWTXtMglKE",
        content: `### Binary Trees & Tree Traversals\n\nHierarchical data structures, DFS (inorder, preorder, postorder) and BFS level-order traversals.`,
        resources: [{ title: "Tree Traversal Visualizer", url: "https://visualgo.net/en/bst" }],
      },
    ],
  },
  {
    title: "DevOps & Cloud Engineering",
    description:
      "Bridge code and production infrastructure. Learn Docker containerization, CI/CD pipelines, Kubernetes basics, and resilient cloud deployments.",
    category: "Cloud & DevOps",
    level: "Intermediate",
    instructor: "SkillSprint Team",
    thumbnail: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=800&q=80",
    duration: "28 hours",
    totalLessons: 10,
    lessons: [
      {
        lessonNumber: 1,
        title: "DevOps Philosophy & Modern Workflow",
        description: "The DevOps lifecycle, infrastructure as code principles, and reliability culture.",
        duration: "30 mins",
        videoUrl: "https://www.youtube.com/embed/0yWAtQ6wYNM",
        content: `### Understanding Modern DevOps\n\nLearn how collaboration, automation, and continuous feedback loops accelerate deployment velocity while increasing uptime.`,
        resources: [{ title: "The DevOps Roadmap", url: "https://roadmap.sh/devops" }],
      },
      {
        lessonNumber: 2,
        title: "Linux Command Line for Engineers",
        description: "Shell scripting, file permissions, process monitoring, and networking utilities.",
        duration: "45 mins",
        videoUrl: "https://www.youtube.com/embed/ZtqBQ68cfJc",
        content: `### Essential Linux Administration\n\nMaster \`ssh\`, \`curl\`, \`grep\`, \`systemctl\`, \`htop\`, and environment variable management.`,
        resources: [{ title: "Linux Journey", url: "https://linuxjourney.com/" }],
      },
      {
        lessonNumber: 3,
        title: "Docker Essentials & Containers",
        description: "Containers vs virtual machines, Dockerfiles, images, and container lifecycles.",
        duration: "50 mins",
        videoUrl: "https://www.youtube.com/embed/pTFZFxd4hOI",
        content: `### Containerization with Docker\n\nPackage apps with all dependencies into reproducible container images.`,
        resources: [{ title: "Docker Docs", url: "https://docs.docker.com/" }],
      },
      {
        lessonNumber: 4,
        title: "Docker Compose for Multi-Container Apps",
        description: "Orchestrating React client, Node server, and MongoDB with docker-compose.yml.",
        duration: "45 mins",
        videoUrl: "https://www.youtube.com/embed/HG6yIjYapSA",
        content: `### Multi-Container Orchestration\n\nLink backend services, frontend web servers, and local databases via internal virtual networks.`,
        resources: [{ title: "Compose Documentation", url: "https://docs.docker.com/compose/" }],
      },
      {
        lessonNumber: 5,
        title: "Git Workflows & Trunk-Based Development",
        description: "Branching strategies, pull requests, conventional commits, and merge conflict resolution.",
        duration: "35 mins",
        videoUrl: "https://www.youtube.com/embed/RGOj5yH7evk",
        content: `### Professional Git Strategies\n\nTrunk-based development, semantic versioning, and feature flags.`,
        resources: [{ title: "Git Guide", url: "https://git-scm.com/doc" }],
      },
      {
        lessonNumber: 6,
        title: "CI/CD with GitHub Actions",
        description: "Automate tests, lint checks, build artifacts, and cloud deploy steps on git push.",
        duration: "50 mins",
        videoUrl: "https://www.youtube.com/embed/R8_veQiYBjI",
        content: `### Continuous Integration & Continuous Delivery\n\nWrite YAML workflows with triggers, secrets, matrix testing, and automated deploy scripts.`,
        resources: [{ title: "GitHub Actions Docs", url: "https://docs.github.com/en/actions" }],
      },
      {
        lessonNumber: 7,
        title: "Cloud Infrastructure (Render & Vercel)",
        description: "Deploying single page applications to edge CDNs and web services to container platforms.",
        duration: "40 mins",
        videoUrl: "https://www.youtube.com/embed/Vq0QYgY3y0g",
        content: `### Cloud Deployments\n\nConfigure custom domains, SSL certificates, build settings, and persistent database add-ons.`,
        resources: [{ title: "Vercel Docs", url: "https://vercel.com/docs" }],
      },
      {
        lessonNumber: 8,
        title: "Kubernetes Core Concepts",
        description: "Pods, Services, Deployments, ConfigMaps, and cluster orchestration fundamentals.",
        duration: "60 mins",
        videoUrl: "https://www.youtube.com/embed/X48VuDVv0do",
        content: `### Introduction to Kubernetes\n\nUnderstand container scheduling, self-healing nodes, and declarative YAML specs.`,
        resources: [{ title: "Kubernetes Basics", url: "https://kubernetes.io/docs/tutorials/kubernetes-basics/" }],
      },
      {
        lessonNumber: 9,
        title: "Monitoring, Logging & Health Checks",
        description: "Structured logging, uptime monitors, Prometheus metrics, and alerting.",
        duration: "40 mins",
        videoUrl: "https://www.youtube.com/embed/9Tyx331P81g",
        content: `### Observability & Site Reliability\n\nImplement /api/health endpoints, response latency monitors, and proactive outage alerts.`,
        resources: [{ title: "Google SRE Book", url: "https://sre.google/sre-book/table-of-contents/" }],
      },
      {
        lessonNumber: 10,
        title: "Zero-Downtime Deployment Capstone",
        description: "Blue-green and rolling release configurations with rollback strategies.",
        duration: "55 mins",
        videoUrl: "https://www.youtube.com/embed/4h9A7K9Y6x0",
        content: `### Production Capstone: Zero-Downtime Deployment\n\nImplement health-checked rolling updates ensuring 100% user traffic continuity during code upgrades.`,
        resources: [{ title: "Release Strategies", url: "https://martinfowler.com/bliki/BlueGreenDeployment.html" }],
      },
    ],
  },
  {
    title: "Modern React & State Architecture",
    description:
      "Deep dive into advanced React patterns, performance optimization, client-side routing, and modern state management.",
    category: "Frontend",
    level: "Intermediate",
    instructor: "SkillSprint Team",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80",
    duration: "25 hours",
    totalLessons: 10,
    lessons: [
      {
        lessonNumber: 1,
        title: "React 19 & Modern Component Models",
        description: "Server Actions, the use hook, automatic batching, and concurrent rendering.",
        duration: "35 mins",
        videoUrl: "https://www.youtube.com/embed/SqcY0GlETPk",
        content: `### Next-Gen React\n\nExplore React 19 capabilities: new hooks, concurrent rendering, and cleaner component composition.`,
        resources: [{ title: "React 19 Release Notes", url: "https://react.dev/blog/2024/04/25/react-19" }],
      },
      {
        lessonNumber: 2,
        title: "State Management Paradigms",
        description: "Comparing local state, Context API, Zustand, and Redux Toolkit.",
        duration: "45 mins",
        videoUrl: "https://www.youtube.com/embed/5-1LM2NySRs",
        content: `### When to Use Which State Solution\n\nAvoid prop drilling while preventing unnecessary re-renders with lightweight atomic state libraries.`,
        resources: [{ title: "Zustand Documentation", url: "https://zustand-demo.pmnd.rs/" }],
      },
      {
        lessonNumber: 3,
        title: "Custom Hooks & Logic Decoupling",
        description: "Extracting business logic into isolated, testable custom hooks.",
        duration: "40 mins",
        videoUrl: "https://www.youtube.com/embed/6ThXsUwLWvc",
        content: `### Designing Custom Hooks\n\nEncapsulate asynchronous fetching, local storage synchronization, and keyboard shortcuts.`,
        resources: [{ title: "usehooks-ts", url: "https://usehooks-ts.com/" }],
      },
      {
        lessonNumber: 4,
        title: "React Router 7 & Navigation Guards",
        description: "Dynamic routing, query params, nested layouts, and auth protection wrappers.",
        duration: "45 mins",
        videoUrl: "https://www.youtube.com/embed/Ul3y1LXxzdU",
        content: `### Production Client Routing\n\nImplement route protection, scroll restoration, and breadcrumb navigation with React Router.`,
        resources: [{ title: "React Router Docs", url: "https://reactrouter.com/" }],
      },
      {
        lessonNumber: 5,
        title: "Performance Optimization & Profiling",
        description: "React Profiler, React.memo, useMemo, useCallback, and virtualized lists.",
        duration: "50 mins",
        videoUrl: "https://www.youtube.com/embed/DEPwA3mv_R8",
        content: `### High-Performance React\n\nIdentify re-render bottlenecks using React DevTools Profiler and eliminate sluggish UI lag.`,
        resources: [{ title: "React Performance Guide", url: "https://react.dev/learn/render-and-commit" }],
      },
      {
        lessonNumber: 6,
        title: "Forms & Validations",
        description: "Controlled vs uncontrolled components, custom validation hooks, and accessibility.",
        duration: "40 mins",
        videoUrl: "https://www.youtube.com/embed/tIdNeoHniEY",
        content: `### Accessible, Robust Forms\n\nHandle input masks, real-time validation feedback, and clean submission states.`,
        resources: [{ title: "Formik & React Hook Form", url: "https://react-hook-form.com/" }],
      },
      {
        lessonNumber: 7,
        title: "Design Systems & Glassmorphism",
        description: "Building responsive dark mode UI kits with modern CSS tokens and backdrop filters.",
        duration: "45 mins",
        videoUrl: "https://www.youtube.com/embed/n0vhBHC5eIA",
        content: `### Crafting Premium Glassmorphic Interfaces\n\nImplement subtle border glows, gradient accents, fluid typography, and micro-interactions.`,
        resources: [{ title: "Glassmorphism Generator", url: "https://hype4.academy/tools/glassmorphism-generator" }],
      },
      {
        lessonNumber: 8,
        title: "Data Fetching & Cache Synchronization",
        description: "Handling loading states, optimistic UI updates, retry logic, and error boundaries.",
        duration: "50 mins",
        videoUrl: "https://www.youtube.com/embed/novnyCbeQzc",
        content: `### Resilient Client Data Fetching\n\nHandle race conditions, cancellation tokens, stale-while-revalidate caching, and user error alerts.`,
        resources: [{ title: "TanStack Query", url: "https://tanstack.com/query/latest" }],
      },
      {
        lessonNumber: 9,
        title: "Testing Components",
        description: "Unit testing components with Vitest and React Testing Library.",
        duration: "45 mins",
        videoUrl: "https://www.youtube.com/embed/JBSUgDxICg8",
        content: `### Testing User Interactions\n\nWrite tests from the user's perspective, verifying render states and event responses.`,
        resources: [{ title: "Testing Library Docs", url: "https://testing-library.com/docs/react-testing-library/intro/" }],
      },
      {
        lessonNumber: 10,
        title: "Production Deployment & PWA",
        description: "Code splitting with lazy loading, asset caching, and progressive web app manifests.",
        duration: "55 mins",
        videoUrl: "https://www.youtube.com/embed/4deVCNJq3qc",
        content: `### Shipping Production React Apps\n\nConfigure dynamic imports, bundle size analyzer, and service worker offline caching.`,
        resources: [{ title: "Web.dev PWA", url: "https://web.dev/explore/progressive-web-apps" }],
      },
    ],
  },
];

async function seedCourses() {
  try {
    console.log("Connecting to MongoDB for seeding...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    console.log("Removing old sample courses...");
    await Course.deleteMany({});

    console.log(`Inserting ${SAMPLE_COURSES.length} rich sample courses...`);
    const createdCourses = await Course.insertMany(SAMPLE_COURSES);

    console.log(
      `Created courses:\n` +
        createdCourses
          .map(
            (c, i) =>
              `  ${i + 1}. ${c.title} (${c.category}, ${c.lessons.length} lessons)`
          )
          .join("\n")
    );

    console.log("Courses seeded successfully!");
  } catch (error) {
    console.error("Error seeding courses:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed.");
  }
}

seedCourses();
