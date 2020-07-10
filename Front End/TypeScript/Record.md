# Record
> 用来拷贝属性, 会将一个类型的所有属性值都映射到另一个类型上并创造一个新的类型,
> 个人理解就是以一个对象为key将后一个对象类型作为每个key的value

## Source
```typescript
/**
 * Construct a type with a set of properties K of type T
 */
type Record<K extends keyof any, T> = {
    [P in K]: T;
};
```

## Example
```typescript
type type1 = Record<string, boolean>;
const test: type1 = {
    'foo': true
};
``` 
