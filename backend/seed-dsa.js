import mongoose from 'mongoose';
import dotenv from 'dotenv';
import DsaProblem from './models/DsaProblem.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/codesprint50')
  .then(() => console.log('Connected to MongoDB for DSA Seeding'))
  .catch((err) => console.error('MongoDB connection error:', err));

const problems = [
  // ======================================
  // ARRAYS (8)
  // ======================================
  {
    slug: 'arrays-sum',
    order: 1,
    title: 'Sum of Array Elements',
    topic: 'arrays',
    difficulty: 'Easy',
    companies: ['TCS', 'Infosys', 'Wipro', 'Cognizant'],
    description: 'Given an array of integers, compute and print the sum of all elements.',
    constraints: '1 ≤ n ≤ 10^5\n-10^4 ≤ arr[i] ≤ 10^4',
    starterCode: `public class Main {
    public static int arraySum(int[] arr) {
        // TODO: return the sum of all elements
        int sum = 0;
        return sum;
    }

    public static void main(String[] args) {
        int[] arr = {1, 2, 3, 4, 5};
        System.out.println(arraySum(arr));
        // Expected: 15
    }
}`,
    hints: ['A single pass with a running total is enough.', 'Watch out for integer overflow if n and arr[i] are large — use long if needed.'],
    sampleTests: [
      { input: '[1,2,3,4,5]', expectedOutput: '15' },
      { input: '[-1,-2,-3]', expectedOutput: '-6' }
    ]
  },
  {
    slug: 'arrays-max-element',
    order: 2,
    title: 'Maximum Element in Array',
    topic: 'arrays',
    difficulty: 'Easy',
    companies: ['TCS', 'Infosys', 'Accenture'],
    description: 'Find and print the maximum element in an array.',
    constraints: '1 ≤ n ≤ 10^5',
    starterCode: `public class Main {
    public static int findMax(int[] arr) {
        // TODO
        return 0;
    }

    public static void main(String[] args) {
        int[] arr = {3, 1, 9, 4, 7};
        System.out.println(findMax(arr));
        // Expected: 9
    }
}`,
    hints: ['Initialize max with the first element, not 0 — arrays can contain negatives.'],
    sampleTests: [
      { input: '[3,1,9,4,7]', expectedOutput: '9' },
      { input: '[-5,-2,-9]', expectedOutput: '-2' }
    ]
  },
  {
    slug: 'arrays-reverse',
    order: 3,
    title: 'Reverse an Array',
    topic: 'arrays',
    difficulty: 'Easy',
    companies: ['TCS', 'Capgemini', 'Wipro'],
    description: 'Reverse the given array in-place and print it.',
    constraints: '1 ≤ n ≤ 10^5',
    starterCode: `import java.util.Arrays;
public class Main {
    public static void reverse(int[] arr) {
        // TODO: reverse in-place using two pointers
    }

    public static void main(String[] args) {
        int[] arr = {1, 2, 3, 4, 5};
        reverse(arr);
        System.out.println(Arrays.toString(arr));
        // Expected: [5, 4, 3, 2, 1]
    }
}`,
    hints: ['Use two pointers (left = 0, right = n-1) and swap while left < right.'],
    sampleTests: [{ input: '[1,2,3,4,5]', expectedOutput: '[5, 4, 3, 2, 1]' }]
  },
  {
    slug: 'arrays-second-largest',
    order: 4,
    title: 'Second Largest Element',
    topic: 'arrays',
    difficulty: 'Easy',
    companies: ['Infosys', 'TCS', 'Cognizant'],
    description: 'Find the second largest DISTINCT element in the array. Print -1 if it does not exist.',
    constraints: '1 ≤ n ≤ 10^5',
    starterCode: `public class Main {
    public static int secondLargest(int[] arr) {
        // TODO
        return -1;
    }

    public static void main(String[] args) {
        int[] arr = {10, 5, 10, 8, 3};
        System.out.println(secondLargest(arr));
        // Expected: 8
    }
}`,
    hints: ['Track two variables — largest and secondLargest — in a single pass.', 'Be careful with duplicates of the largest value.'],
    sampleTests: [
      { input: '[10,5,10,8,3]', expectedOutput: '8' },
      { input: '[5,5,5]', expectedOutput: '-1' }
    ]
  },
  {
    slug: 'arrays-rotate',
    order: 5,
    title: 'Rotate Array by K',
    topic: 'arrays',
    difficulty: 'Medium',
    companies: ['TCS', 'Infosys', 'Amazon'],
    description: 'Rotate the array to the right by k steps. k can be larger than array length.',
    constraints: '1 ≤ n ≤ 10^5\n0 ≤ k ≤ 10^9',
    starterCode: `import java.util.Arrays;
public class Main {
    public static void rotate(int[] arr, int k) {
        // TODO: rotate in-place
    }

    public static void main(String[] args) {
        int[] arr = {1, 2, 3, 4, 5, 6, 7};
        rotate(arr, 3);
        System.out.println(Arrays.toString(arr));
        // Expected: [5, 6, 7, 1, 2, 3, 4]
    }
}`,
    hints: ['Take k modulo n first.', 'Reverse-based approach: reverse whole array, then reverse first k elements, then reverse the rest.'],
    sampleTests: [{ input: '[1,2,3,4,5,6,7], k=3', expectedOutput: '[5, 6, 7, 1, 2, 3, 4]' }]
  },
  {
    slug: 'arrays-move-zeroes',
    order: 6,
    title: 'Move Zeroes to End',
    topic: 'arrays',
    difficulty: 'Easy',
    companies: ['Facebook', 'TCS', 'Wipro'],
    description: 'Move all zeros to the end of the array while keeping the relative order of non-zero elements. In-place.',
    constraints: '1 ≤ n ≤ 10^4',
    starterCode: `import java.util.Arrays;
public class Main {
    public static void moveZeroes(int[] arr) {
        // TODO
    }

    public static void main(String[] args) {
        int[] arr = {0, 1, 0, 3, 12};
        moveZeroes(arr);
        System.out.println(Arrays.toString(arr));
        // Expected: [1, 3, 12, 0, 0]
    }
}`,
    hints: ['Two-pointer: one writes non-zeros to the front, then fill rest with zeros.'],
    sampleTests: [{ input: '[0,1,0,3,12]', expectedOutput: '[1, 3, 12, 0, 0]' }]
  },
  {
    slug: 'arrays-subarray-max-sum',
    order: 7,
    title: 'Maximum Subarray Sum (Kadane)',
    topic: 'arrays',
    difficulty: 'Medium',
    companies: ['Amazon', 'Microsoft', 'Infosys'],
    description: 'Find the contiguous subarray within a 1D array that has the largest sum and return that sum.',
    constraints: '1 ≤ n ≤ 10^5\n-10^4 ≤ arr[i] ≤ 10^4',
    starterCode: `public class Main {
    public static int maxSubArray(int[] arr) {
        // TODO: Kadane's algorithm
        return 0;
    }

    public static void main(String[] args) {
        int[] arr = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
        System.out.println(maxSubArray(arr));
        // Expected: 6 (subarray [4, -1, 2, 1])
    }
}`,
    hints: ["Kadane: currentSum = max(arr[i], currentSum + arr[i]); maxSum = max(maxSum, currentSum).", 'Initialize with the first element, not 0.'],
    sampleTests: [{ input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6' }]
  },
  {
    slug: 'arrays-two-sum',
    order: 8,
    title: 'Two Sum',
    topic: 'arrays',
    difficulty: 'Easy',
    companies: ['Amazon', 'Google', 'TCS', 'Infosys'],
    description: 'Given an array and target T, return indices of the two numbers such that they add up to T. Assume exactly one solution exists.',
    constraints: '2 ≤ n ≤ 10^4',
    starterCode: `import java.util.Arrays;
public class Main {
    public static int[] twoSum(int[] arr, int target) {
        // TODO: use a HashMap for O(n)
        return new int[]{-1, -1};
    }

    public static void main(String[] args) {
        int[] arr = {2, 7, 11, 15};
        int target = 9;
        System.out.println(Arrays.toString(twoSum(arr, target)));
        // Expected: [0, 1]
    }
}`,
    hints: ['Store each element and its index in a HashMap.', 'For each arr[i], check if (target - arr[i]) exists in the map.'],
    sampleTests: [{ input: '[2,7,11,15], t=9', expectedOutput: '[0, 1]' }]
  },

  // ======================================
  // STRINGS (6)
  // ======================================
  {
    slug: 'strings-palindrome',
    order: 9,
    title: 'Palindrome Check',
    topic: 'strings',
    difficulty: 'Easy',
    companies: ['TCS', 'Infosys', 'Wipro', 'Accenture'],
    description: 'Check whether a string reads the same forward and backward (case-insensitive).',
    constraints: '1 ≤ len ≤ 10^5',
    starterCode: `public class Main {
    public static boolean isPalindrome(String s) {
        // TODO: two-pointer approach
        return false;
    }

    public static void main(String[] args) {
        System.out.println(isPalindrome("Madam"));
        // Expected: true
    }
}`,
    hints: ['Convert to lowercase first.', 'Two-pointer: compare chars at left and right, move inward.'],
    sampleTests: [
      { input: 'Madam', expectedOutput: 'true' },
      { input: 'hello', expectedOutput: 'false' }
    ]
  },
  {
    slug: 'strings-reverse-words',
    order: 10,
    title: 'Reverse Words in a String',
    topic: 'strings',
    difficulty: 'Easy',
    companies: ['Amazon', 'TCS', 'Capgemini'],
    description: 'Reverse the ORDER of words. Preserve single spaces between words. Strip leading/trailing spaces.',
    constraints: '1 ≤ len ≤ 10^4',
    starterCode: `public class Main {
    public static String reverseWords(String s) {
        // TODO
        return "";
    }

    public static void main(String[] args) {
        System.out.println(reverseWords("  the sky is blue  "));
        // Expected: "blue is sky the"
    }
}`,
    hints: ['split("\\\\s+") handles multiple spaces.', 'Build the result in reverse order.'],
    sampleTests: [{ input: '  the sky is blue  ', expectedOutput: 'blue is sky the' }]
  },
  {
    slug: 'strings-anagram',
    order: 11,
    title: 'Check Anagram',
    topic: 'strings',
    difficulty: 'Easy',
    companies: ['TCS', 'Wipro', 'Infosys'],
    description: 'Check if two strings are anagrams of each other (same characters in any order).',
    constraints: '1 ≤ len ≤ 10^4',
    starterCode: `public class Main {
    public static boolean isAnagram(String a, String b) {
        // TODO: count characters
        return false;
    }

    public static void main(String[] args) {
        System.out.println(isAnagram("listen", "silent"));
        // Expected: true
    }
}`,
    hints: ['If lengths differ, return false immediately.', 'Use a 26-size int array to count chars; increment for a, decrement for b.'],
    sampleTests: [{ input: 'listen, silent', expectedOutput: 'true' }]
  },
  {
    slug: 'strings-first-unique',
    order: 12,
    title: 'First Unique Character',
    topic: 'strings',
    difficulty: 'Easy',
    companies: ['Amazon', 'Cognizant', 'TCS'],
    description: 'Given a string, find the index of the first non-repeating character. Return -1 if none exist.',
    constraints: '1 ≤ len ≤ 10^5',
    starterCode: `public class Main {
    public static int firstUniqueChar(String s) {
        // TODO
        return -1;
    }

    public static void main(String[] args) {
        System.out.println(firstUniqueChar("leetcode"));
        // Expected: 0
    }
}`,
    hints: ['Count characters first, then iterate to find the first with count 1.'],
    sampleTests: [
      { input: 'leetcode', expectedOutput: '0' },
      { input: 'aabb', expectedOutput: '-1' }
    ]
  },
  {
    slug: 'strings-longest-unique',
    order: 13,
    title: 'Longest Substring Without Repeating Characters',
    topic: 'strings',
    difficulty: 'Medium',
    companies: ['Amazon', 'Google', 'TCS'],
    description: 'Find the length of the longest substring without any repeating characters.',
    constraints: '0 ≤ len ≤ 5×10^4',
    starterCode: `public class Main {
    public static int lengthOfLongestSubstring(String s) {
        // TODO: sliding window with a Set
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(lengthOfLongestSubstring("abcabcbb"));
        // Expected: 3 ("abc")
    }
}`,
    hints: ['Sliding window: expand right, shrink left when duplicate is found.', 'Use a HashSet to track current window chars.'],
    sampleTests: [
      { input: 'abcabcbb', expectedOutput: '3' },
      { input: 'bbbbb', expectedOutput: '1' }
    ]
  },
  {
    slug: 'strings-string-compression',
    order: 14,
    title: 'String Compression',
    topic: 'strings',
    difficulty: 'Medium',
    companies: ['Accenture', 'Infosys'],
    description: 'Compress a string by replacing consecutive repeating characters with the character followed by the count. Return the compressed form only if it is shorter, else return the original.',
    constraints: '1 ≤ len ≤ 10^4',
    starterCode: `public class Main {
    public static String compress(String s) {
        // TODO
        return s;
    }

    public static void main(String[] args) {
        System.out.println(compress("aabcccccaaa"));
        // Expected: "a2b1c5a3"
    }
}`,
    hints: ['Scan once, group consecutive same chars.', 'StringBuilder for efficient appends.'],
    sampleTests: [{ input: 'aabcccccaaa', expectedOutput: 'a2b1c5a3' }]
  },

  // ======================================
  // LINKED LIST (4)
  // ======================================
  {
    slug: 'll-reverse',
    order: 15,
    title: 'Reverse a Linked List',
    topic: 'linked-list',
    difficulty: 'Easy',
    companies: ['Amazon', 'Microsoft', 'TCS', 'Infosys'],
    description: 'Reverse a singly linked list iteratively.',
    constraints: '0 ≤ n ≤ 5000',
    starterCode: `class ListNode {
    int val;
    ListNode next;
    ListNode(int v) { val = v; }
}

public class Main {
    public static ListNode reverse(ListNode head) {
        // TODO: iterative three-pointer reversal
        return head;
    }

    public static void print(ListNode h) {
        while (h != null) { System.out.print(h.val + " "); h = h.next; }
        System.out.println();
    }

    public static void main(String[] args) {
        // 1 -> 2 -> 3 -> null
        ListNode head = new ListNode(1);
        head.next = new ListNode(2);
        head.next.next = new ListNode(3);
        print(reverse(head));
        // Expected: 3 2 1
    }
}`,
    hints: ['Keep three pointers: prev, curr, next.', 'At each step: save next, point curr.next to prev, advance.'],
    sampleTests: [{ input: '1->2->3', expectedOutput: '3 2 1 ' }]
  },
  {
    slug: 'll-detect-cycle',
    order: 16,
    title: 'Detect Cycle in Linked List',
    topic: 'linked-list',
    difficulty: 'Medium',
    companies: ['Amazon', 'Google', 'TCS'],
    description: "Return true if there's a cycle. Use Floyd's tortoise-and-hare.",
    constraints: '0 ≤ n ≤ 10^4',
    starterCode: `class ListNode {
    int val;
    ListNode next;
    ListNode(int v) { val = v; }
}

public class Main {
    public static boolean hasCycle(ListNode head) {
        // TODO: fast/slow pointers
        return false;
    }

    public static void main(String[] args) {
        ListNode head = new ListNode(1);
        head.next = new ListNode(2);
        head.next.next = new ListNode(3);
        head.next.next.next = head.next; // creates a cycle
        System.out.println(hasCycle(head));
        // Expected: true
    }
}`,
    hints: ['slow moves 1, fast moves 2. If they meet, cycle exists.', 'If fast reaches null, no cycle.'],
    sampleTests: [{ input: 'cyclic list', expectedOutput: 'true' }]
  },
  {
    slug: 'll-merge-sorted',
    order: 17,
    title: 'Merge Two Sorted Lists',
    topic: 'linked-list',
    difficulty: 'Easy',
    companies: ['Amazon', 'Microsoft', 'Infosys'],
    description: 'Merge two sorted linked lists into one sorted list.',
    constraints: '0 ≤ n1, n2 ≤ 50',
    starterCode: `class ListNode {
    int val;
    ListNode next;
    ListNode(int v) { val = v; }
}

public class Main {
    public static ListNode merge(ListNode a, ListNode b) {
        // TODO: dummy node + tail pointer
        return null;
    }

    public static void print(ListNode h) {
        while (h != null) { System.out.print(h.val + " "); h = h.next; }
        System.out.println();
    }

    public static void main(String[] args) {
        // a: 1 -> 3 -> 5, b: 2 -> 4 -> 6
        ListNode a = new ListNode(1); a.next = new ListNode(3); a.next.next = new ListNode(5);
        ListNode b = new ListNode(2); b.next = new ListNode(4); b.next.next = new ListNode(6);
        print(merge(a, b));
        // Expected: 1 2 3 4 5 6
    }
}`,
    hints: ['Use a dummy head to simplify edge cases.', 'Compare and splice nodes one at a time.'],
    sampleTests: [{ input: '[1,3,5], [2,4,6]', expectedOutput: '1 2 3 4 5 6 ' }]
  },
  {
    slug: 'll-remove-nth',
    order: 18,
    title: 'Remove Nth Node from End',
    topic: 'linked-list',
    difficulty: 'Medium',
    companies: ['Amazon', 'Google'],
    description: 'Remove the nth node from the END of the list and return the head.',
    constraints: '1 ≤ size ≤ 30\n1 ≤ n ≤ size',
    starterCode: `class ListNode {
    int val;
    ListNode next;
    ListNode(int v) { val = v; }
}

public class Main {
    public static ListNode removeNthFromEnd(ListNode head, int n) {
        // TODO: two pointers, one n ahead
        return head;
    }

    public static void print(ListNode h) {
        while (h != null) { System.out.print(h.val + " "); h = h.next; }
        System.out.println();
    }

    public static void main(String[] args) {
        // 1 -> 2 -> 3 -> 4 -> 5, n=2 → remove 4
        ListNode head = new ListNode(1);
        head.next = new ListNode(2);
        head.next.next = new ListNode(3);
        head.next.next.next = new ListNode(4);
        head.next.next.next.next = new ListNode(5);
        print(removeNthFromEnd(head, 2));
        // Expected: 1 2 3 5
    }
}`,
    hints: ['Advance fast pointer n steps; then move both until fast.next == null; slow is now at the node BEFORE the one to remove.', 'Use a dummy node to handle removing the head.'],
    sampleTests: [{ input: '1->2->3->4->5, n=2', expectedOutput: '1 2 3 5 ' }]
  },

  // ======================================
  // STACK & QUEUE (4)
  // ======================================
  {
    slug: 'stack-valid-parentheses',
    order: 19,
    title: 'Valid Parentheses',
    topic: 'stack-queue',
    difficulty: 'Easy',
    companies: ['Amazon', 'Google', 'TCS', 'Infosys'],
    description: 'Given a string containing only (), [], {}, determine if the brackets are balanced.',
    constraints: '1 ≤ len ≤ 10^4',
    starterCode: `import java.util.Stack;
public class Main {
    public static boolean isValid(String s) {
        // TODO: stack
        return false;
    }

    public static void main(String[] args) {
        System.out.println(isValid("({[]})"));
        // Expected: true
        System.out.println(isValid("([)]"));
        // Expected: false
    }
}`,
    hints: ['Push opens onto stack; for closers, pop and check match.', 'Stack must be empty at the end.'],
    sampleTests: [
      { input: '({[]})', expectedOutput: 'true' },
      { input: '([)]', expectedOutput: 'false' }
    ]
  },
  {
    slug: 'stack-min-stack',
    order: 20,
    title: 'Min Stack (O(1) min)',
    topic: 'stack-queue',
    difficulty: 'Medium',
    companies: ['Amazon', 'Microsoft'],
    description: 'Design a stack supporting push/pop/top/getMin all in O(1). Implement methods and demonstrate them in main.',
    constraints: '0 ≤ operations ≤ 3×10^4',
    starterCode: `import java.util.Stack;
class MinStack {
    // TODO: keep a secondary stack of current minimums
    public MinStack() {}
    public void push(int val) {}
    public void pop() {}
    public int top() { return 0; }
    public int getMin() { return 0; }
}

public class Main {
    public static void main(String[] args) {
        MinStack s = new MinStack();
        s.push(-2); s.push(0); s.push(-3);
        System.out.println(s.getMin()); // -3
        s.pop();
        System.out.println(s.top());    // 0
        System.out.println(s.getMin()); // -2
    }
}`,
    hints: ['Keep an auxiliary stack that mirrors the min at each level.', 'When pushing x, push min(x, auxTop) onto the aux stack.'],
    sampleTests: [{ input: 'push(-2), push(0), push(-3), getMin, pop, top, getMin', expectedOutput: '-3\n0\n-2' }]
  },
  {
    slug: 'queue-using-stacks',
    order: 21,
    title: 'Implement Queue Using Two Stacks',
    topic: 'stack-queue',
    difficulty: 'Medium',
    companies: ['Amazon', 'Google'],
    description: 'Implement a FIFO queue using only standard stack operations. Support enqueue, dequeue, peek.',
    constraints: '0 ≤ operations ≤ 100',
    starterCode: `import java.util.Stack;
class MyQueue {
    // TODO
    public MyQueue() {}
    public void push(int x) {}
    public int pop() { return 0; }
    public int peek() { return 0; }
    public boolean empty() { return true; }
}

public class Main {
    public static void main(String[] args) {
        MyQueue q = new MyQueue();
        q.push(1); q.push(2);
        System.out.println(q.peek()); // 1
        System.out.println(q.pop());  // 1
        System.out.println(q.empty()); // false
    }
}`,
    hints: ['Two stacks: input for pushes, output for pops.', 'When output is empty and a pop/peek happens, drain input into output.'],
    sampleTests: [{ input: 'push(1), push(2), peek, pop, empty', expectedOutput: '1\n1\nfalse' }]
  },
  {
    slug: 'stack-next-greater',
    order: 22,
    title: 'Next Greater Element',
    topic: 'stack-queue',
    difficulty: 'Medium',
    companies: ['Amazon', 'Infosys', 'TCS'],
    description: 'For each element, print the first greater element to its right. -1 if none.',
    constraints: '1 ≤ n ≤ 10^4',
    starterCode: `import java.util.Arrays;
import java.util.Stack;
public class Main {
    public static int[] nextGreater(int[] arr) {
        // TODO: monotonic stack
        return arr;
    }

    public static void main(String[] args) {
        int[] arr = {4, 5, 2, 10, 8};
        System.out.println(Arrays.toString(nextGreater(arr)));
        // Expected: [5, 10, 10, -1, -1]
    }
}`,
    hints: ['Iterate right-to-left. Stack keeps potential "next greater" candidates.', 'Pop while stack top ≤ current element.'],
    sampleTests: [{ input: '[4,5,2,10,8]', expectedOutput: '[5, 10, 10, -1, -1]' }]
  },

  // ======================================
  // HASHING (4)
  // ======================================
  {
    slug: 'hashing-intersection',
    order: 23,
    title: 'Array Intersection',
    topic: 'hashing',
    difficulty: 'Easy',
    companies: ['Amazon', 'TCS', 'Wipro'],
    description: 'Given two arrays, return their intersection (unique elements present in both).',
    constraints: '1 ≤ n1, n2 ≤ 10^3',
    starterCode: `import java.util.*;
public class Main {
    public static int[] intersection(int[] a, int[] b) {
        // TODO: use HashSet
        return new int[0];
    }

    public static void main(String[] args) {
        int[] a = {1, 2, 2, 1};
        int[] b = {2, 2};
        System.out.println(Arrays.toString(intersection(a, b)));
        // Expected: [2]
    }
}`,
    hints: ['Put elements of a into a HashSet, iterate b and collect matches.', 'Use a result Set to dedupe.'],
    sampleTests: [{ input: '[1,2,2,1], [2,2]', expectedOutput: '[2]' }]
  },
  {
    slug: 'hashing-group-anagrams',
    order: 24,
    title: 'Group Anagrams',
    topic: 'hashing',
    difficulty: 'Medium',
    companies: ['Amazon', 'Google', 'Facebook'],
    description: 'Group the given strings by anagram. Return list of groups.',
    constraints: '1 ≤ n ≤ 10^4',
    starterCode: `import java.util.*;
public class Main {
    public static List<List<String>> groupAnagrams(String[] strs) {
        // TODO: use sorted string as key
        return new ArrayList<>();
    }

    public static void main(String[] args) {
        String[] strs = {"eat", "tea", "tan", "ate", "nat", "bat"};
        System.out.println(groupAnagrams(strs));
        // Expected: [[eat, tea, ate], [tan, nat], [bat]] (order may vary)
    }
}`,
    hints: ['Sort chars of each string; use sorted as HashMap key.', 'Map<String, List<String>> groups.'],
    sampleTests: [{ input: '["eat","tea","tan","ate","nat","bat"]', expectedOutput: '3 groups' }]
  },
  {
    slug: 'hashing-longest-consecutive',
    order: 25,
    title: 'Longest Consecutive Sequence',
    topic: 'hashing',
    difficulty: 'Medium',
    companies: ['Amazon', 'Google'],
    description: 'Given an unsorted array, find the length of the longest sequence of consecutive integers. O(n) expected.',
    constraints: '0 ≤ n ≤ 10^5',
    starterCode: `import java.util.*;
public class Main {
    public static int longestConsecutive(int[] arr) {
        // TODO: use HashSet, start counting only from sequence beginnings
        return 0;
    }

    public static void main(String[] args) {
        int[] arr = {100, 4, 200, 1, 3, 2};
        System.out.println(longestConsecutive(arr));
        // Expected: 4 (1,2,3,4)
    }
}`,
    hints: ['Put all elements in a Set.', 'For each x, only start counting if x-1 is NOT in the set — this avoids O(n^2).'],
    sampleTests: [{ input: '[100,4,200,1,3,2]', expectedOutput: '4' }]
  },
  {
    slug: 'hashing-subarray-sum-k',
    order: 26,
    title: 'Subarray Sum Equals K',
    topic: 'hashing',
    difficulty: 'Medium',
    companies: ['Facebook', 'Amazon', 'Microsoft'],
    description: 'Given an integer array and integer k, return the number of contiguous subarrays whose sum equals k.',
    constraints: '1 ≤ n ≤ 2×10^4',
    starterCode: `import java.util.*;
public class Main {
    public static int subarraySum(int[] arr, int k) {
        // TODO: prefix sum + HashMap
        return 0;
    }

    public static void main(String[] args) {
        int[] arr = {1, 1, 1};
        System.out.println(subarraySum(arr, 2));
        // Expected: 2
    }
}`,
    hints: ['Track prefix sum. Count how often (prefixSum - k) has appeared in the map.', 'Initialize map with {0: 1} to handle subarrays starting at index 0.'],
    sampleTests: [{ input: '[1,1,1], k=2', expectedOutput: '2' }]
  },

  // ======================================
  // RECURSION & TREES (4)
  // ======================================
  {
    slug: 'recursion-factorial',
    order: 27,
    title: 'Factorial (Recursion)',
    topic: 'recursion-trees',
    difficulty: 'Easy',
    companies: ['TCS', 'Infosys', 'Wipro'],
    description: 'Compute n! using recursion.',
    constraints: '0 ≤ n ≤ 20 (fits in long)',
    starterCode: `public class Main {
    public static long factorial(int n) {
        // TODO: recursive
        return 1;
    }

    public static void main(String[] args) {
        System.out.println(factorial(5));
        // Expected: 120
    }
}`,
    hints: ['Base case: n ≤ 1 returns 1.', 'Recursive case: n * factorial(n - 1).'],
    sampleTests: [{ input: '5', expectedOutput: '120' }]
  },
  {
    slug: 'recursion-fibonacci',
    order: 28,
    title: 'Fibonacci with Memoization',
    topic: 'recursion-trees',
    difficulty: 'Easy',
    companies: ['TCS', 'Cognizant', 'Accenture'],
    description: "Compute the nth Fibonacci number. Use memoization to avoid O(2^n) blowup.",
    constraints: '0 ≤ n ≤ 50',
    starterCode: `import java.util.*;
public class Main {
    static Map<Integer, Long> memo = new HashMap<>();
    public static long fib(int n) {
        // TODO: memoized recursion
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(fib(10));
        // Expected: 55
    }
}`,
    hints: ['Base: fib(0)=0, fib(1)=1.', 'Cache computed values in the HashMap to reuse.'],
    sampleTests: [{ input: '10', expectedOutput: '55' }]
  },
  {
    slug: 'tree-inorder-traversal',
    order: 29,
    title: 'Binary Tree Inorder Traversal',
    topic: 'recursion-trees',
    difficulty: 'Easy',
    companies: ['Amazon', 'Microsoft', 'Infosys'],
    description: 'Return the inorder (left, root, right) traversal of a binary tree.',
    constraints: '0 ≤ nodes ≤ 100',
    starterCode: `import java.util.*;
class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int v) { val = v; }
}

public class Main {
    public static List<Integer> inorder(TreeNode root) {
        // TODO: recursive
        return new ArrayList<>();
    }

    public static void main(String[] args) {
        //     1
        //      \\
        //       2
        //      /
        //     3
        TreeNode root = new TreeNode(1);
        root.right = new TreeNode(2);
        root.right.left = new TreeNode(3);
        System.out.println(inorder(root));
        // Expected: [1, 3, 2]
    }
}`,
    hints: ['Recurse left, visit node, recurse right.', 'Pass the list to accumulate results.'],
    sampleTests: [{ input: 'tree', expectedOutput: '[1, 3, 2]' }]
  },
  {
    slug: 'tree-max-depth',
    order: 30,
    title: 'Maximum Depth of Binary Tree',
    topic: 'recursion-trees',
    difficulty: 'Easy',
    companies: ['Amazon', 'Google', 'TCS'],
    description: 'Return the maximum depth (number of nodes along the longest root-to-leaf path) of a binary tree.',
    constraints: '0 ≤ nodes ≤ 10^4',
    starterCode: `class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int v) { val = v; }
}

public class Main {
    public static int maxDepth(TreeNode root) {
        // TODO: recursion
        return 0;
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(3);
        root.left = new TreeNode(9);
        root.right = new TreeNode(20);
        root.right.left = new TreeNode(15);
        root.right.right = new TreeNode(7);
        System.out.println(maxDepth(root));
        // Expected: 3
    }
}`,
    hints: ['Base: null node → depth 0.', 'Recursive: 1 + max(depth(left), depth(right)).'],
    sampleTests: [{ input: 'tree', expectedOutput: '3' }]
  }
];

const seedDB = async () => {
  try {
    await DsaProblem.deleteMany({});
    console.log('Cleared existing DSA problems.');
    await DsaProblem.insertMany(problems);
    console.log(`Seeded ${problems.length} DSA problems.`);
    process.exit();
  } catch (err) {
    console.error('DSA seeding error:', err);
    process.exit(1);
  }
};

setTimeout(seedDB, 1500);
