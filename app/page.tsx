import { ApiRenderer } from "@/components/api-renderer"

export default function Page() {
  const apiSchema = {
    api: "https://abc.com/user",
    request: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "用户名称"
        },
        age: {
          type: "integer",
          description: "用户年龄"
        },
        email: {
          type: "string",
          description: "用户电子邮箱"
        },
        phone: {
          type: "string",
          description: "用户电话号码"
        },
        ext: {
          type: ["string", "null", "boolean"],
          description: "多类型字段"
        },
        address: {
          description: "用户地址",
          oneOf: [
            {
              type: "string"
            },
            {
              type: "object",
              properties: {
                province: {
                  type: "string",
                  description: "省份"
                },
                city: {
                  type: "string",
                  description: "城市"
                },
                street: {
                  type: "string",
                  description: "街道"
                }
              }
            }
          ]
        },
        gender: {
          type: "integer",
          description: "用户性别",
          minimum: 0,
          maximum: 2,
          enum: [0, 1, 2],
          "x-enum-description": [
            { value: 0, description: "男" },
            { value: 1, description: "女" },
            { value: 2, description: "未知" }
          ]
        }
        ,
        pets: {
          minItems: 1,
          maxItems: 10,
          type: "array",
          description: "用户的宠物列表",
          items: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "宠物名称"
              },
              species: {
                type: "string",
                description: "宠物种类"
              },
              age: {
                type: "integer",
                description: "宠物年龄"
              },
              vaccinated: {
                type: "boolean",
                description: "是否已接种疫苗"
              },
              details: {
                type: "object",
                description: "宠物详细信息",
                properties: {
                  color: {
                    type: "string",
                    description: "宠物毛色"
                  },
                  weight: {
                    type: "number",
                    description: "宠物体重（公斤）"
                  },
                  specialNeeds: {
                    type: "array",
                    description: "特殊需求",
                    items: {
                      type: "string"
                    }
                  }
                }
              }
            },
            required: [
              "name"
            ]
          }
        }
      },
      required: [
        "name",
        "age",
        "email"
      ]
    },
    response: {
      type: "object",
      properties: {
        code: {
          type: "integer",
          description: "返回码"
        },
        message: {
          type: "string"
        }
      },
      required: [
        "code",
        "message"
      ]

    }
  }

  return <ApiRenderer {...apiSchema} />
}