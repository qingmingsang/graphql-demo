
```
node no-express.js
node express.js
node Constructing.js
```

GraphQL模式语言支持标量类型的String，Int，Float，Boolean，和ID，这样你就可以在你传递给架构直接使用这些buildSchema。

默认情况下，每种类型都是可为空的  `null`以任何标量类型的形式返回都是合法的。使用感叹号`!`指示类型不能为空，`String!`不可为空的字符串也是如此。

要使用列表类型，请将该类型括在方括号中，`[Int]`整数列表也是如此。
