const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");
const { app } = require("electron");

// 确保数据目录存在

const userDataPath = app.getPath("userData");
const dataDir = path.join(userDataPath, "db");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// 数据库文件路径
const dbPath = path.join(dataDir, "app.db");

class Database {
  constructor() {
    this.db = null;
  }

  // 初始化数据库
  async init() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error("无法连接到数据库:", err.message);
          reject(err);
        } else {
          console.log("已连接到SQLite数据库");
          this.createTables()
            .then(() => {
              resolve();
            })
            .catch(reject);
        }
      });
    });
  }

  // 创建表结构
  // 在createTables方法中添加公文表
  async createTables() {
    // 创建组织表
    await this.runQuery(`
      CREATE TABLE IF NOT EXISTS organizations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        parent_id INTEGER,
        status TEXT NOT NULL DEFAULT 'active',
        create_time TEXT NOT NULL,
        FOREIGN KEY (parent_id) REFERENCES organizations (id)
      )
    `);
    // 已删除：description字段

    // 创建员工表
    await this.runQuery(`
      CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        enable_date TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        organization_id INTEGER NOT NULL,
        create_time TEXT NOT NULL,
        FOREIGN KEY (organization_id) REFERENCES organizations (id)
      )
    `);

    // 创建公文表
    await this.runQuery(`
      CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        document_number TEXT NOT NULL,
        document_type TEXT NOT NULL,
        sender_organization TEXT NOT NULL,
        receive_date TEXT NOT NULL,
        is_returned INTEGER NOT NULL DEFAULT 0,
        return_reason TEXT,
        deadline TEXT,
       承办单位_id INTEGER NOT NULL,
       承办人员_id INTEGER NOT NULL,
        is_completed INTEGER NOT NULL DEFAULT 0,
        create_time TEXT NOT NULL,
        processing_time TEXT,
        FOREIGN KEY (承办单位_id) REFERENCES organizations (id),
        FOREIGN KEY (承办人员_id) REFERENCES employees (id)
      )
    `);

    // 创建协办信息表
    await this.runQuery(`
      CREATE TABLE IF NOT EXISTS document_assistants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        document_id INTEGER NOT NULL,
        assist_organization_id INTEGER NOT NULL,
        assist_employee_id INTEGER NOT NULL,
        FOREIGN KEY (document_id) REFERENCES documents (id),
        FOREIGN KEY (assist_organization_id) REFERENCES organizations (id),
        FOREIGN KEY (assist_employee_id) REFERENCES employees (id)
      )
    `);

    // 检查是否需要初始化数据
    const hasData = await this.getOne(
      `SELECT COUNT(*) as count FROM organizations`
    );
    if (hasData.count === 0) {
      await this.initDefaultData();
    }
  }

  // 添加获取公文列表方法
  // 修改getDocuments()方法，确保返回承办单位_id字段
  async getDocuments() {
    const query = `
      SELECT 
        d.id, 
        d.title, 
        d.document_number, 
        d.document_type, 
        d.sender_organization, 
        d.receive_date, 
        d.is_returned, 
        d.return_reason, 
        d.deadline, 
        d.processing_time,
        d.承办单位_id, 
        org.name as 承办单位,
        emp.name || '(' || emp.phone || ')' as 承办人员,
        d.is_completed,
        d.create_time
      FROM documents d
      LEFT JOIN organizations org ON d.承办单位_id = org.id
      LEFT JOIN employees emp ON d.承办人员_id = emp.id
      ORDER BY d.id DESC
    `;
    const documents = await this.getAll(query);

    // 获取每个公文的协办信息
    for (const doc of documents) {
      const assistants = await this.getAll(
        `SELECT 
          o.name as 协办单位,
          e.name || '(' || e.phone || ')' as 协办人员
        FROM document_assistants da
        LEFT JOIN organizations o ON da.assist_organization_id = o.id
        LEFT JOIN employees e ON da.assist_employee_id = e.id
        WHERE da.document_id = ?`,
        [doc.id]
      );
      doc.协办信息 = assistants;
    }

    return documents.map((doc) => ({
      id: doc.id.toString(),
      title: doc.title,
      documentNumber: doc.document_number,
      documentType: doc.document_type,
      senderOrganization: doc.sender_organization,
      receiveDate: doc.receive_date,
      isReturned: doc.is_returned,
      returnReason: doc.return_reason,
      deadline: doc.deadline,
      processingTime: doc.processing_time,
      承办单位_id: doc.承办单位_id, // 添加承办单位_id到返回对象
      承办单位: doc.承办单位,
      承办人员: doc.承办人员,
      协办信息: doc.协办信息,
      isCompleted: doc.is_completed,
      createTime: doc.create_time,
    }));
  }

  // 添加公文方法
  async addDocument(docData) {
    const result = await this.runQuery(
      "INSERT INTO documents (title, document_number, document_type, sender_organization, receive_date, is_returned, return_reason, deadline, processing_time, 承办单位_id, 承办人员_id, is_completed, create_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        docData.title,
        docData.documentNumber,
        docData.documentType,
        docData.senderOrganization,
        docData.receiveDate,
        docData.isReturned ? 1 : 0,
        docData.returnReason,
        docData.deadline,
        docData.processingTime,
        parseInt(docData.承办单位_id),
        parseInt(docData.承办人员_id),
        docData.isCompleted ? 1 : 0,
        docData.createTime,
      ]
    );

    // 添加协办信息
    if (docData.协办信息 && docData.协办信息.length > 0) {
      const documentId = result.lastID;
      for (const assist of docData.协办信息) {
        await this.runQuery(
          "INSERT INTO document_assistants (document_id, assist_organization_id, assist_employee_id) VALUES (?, ?, ?)",
          [
            documentId,
            parseInt(assist.assistOrganizationId),
            parseInt(assist.assistEmployeeId),
          ]
        );
      }
    }

    return result.lastID;
  }

  // 更新公文方法 - 确保正确返回结果
  async updateDocument(id, docData) {
    try {
      console.log(`数据库更新公文: ID=${id}, 数据=`, docData);

      // 构建动态更新语句
      const fields = [];
      const params = [];

      // 只添加有值的字段
      if (docData.title !== undefined)
        fields.push("title = ?"), params.push(docData.title);
      if (docData.documentNumber !== undefined)
        fields.push("document_number = ?"), params.push(docData.documentNumber);
      if (docData.documentType !== undefined)
        fields.push("document_type = ?"), params.push(docData.documentType);
      if (docData.senderOrganization !== undefined)
        fields.push("sender_organization = ?"),
          params.push(docData.senderOrganization);
      if (docData.receiveDate !== undefined)
        fields.push("receive_date = ?"), params.push(docData.receiveDate);
      if (docData.isReturned !== undefined)
        fields.push("is_returned = ?"), params.push(docData.isReturned ? 1 : 0);
      if (docData.returnReason !== undefined)
        fields.push("return_reason = ?"), params.push(docData.returnReason);
      if (docData.deadline !== undefined)
        fields.push("deadline = ?"), params.push(docData.deadline);
      if (docData.processingTime !== undefined)
        fields.push("processing_time = ?"), params.push(docData.processingTime);
      if (docData.承办单位_id !== undefined)
        fields.push("承办单位_id = ?"),
          params.push(parseInt(docData.承办单位_id));
      if (docData.承办人员_id !== undefined)
        fields.push("承办人员_id = ?"),
          params.push(parseInt(docData.承办人员_id));
      if (docData.isCompleted !== undefined)
        fields.push("is_completed = ?"),
          params.push(docData.isCompleted ? 1 : 0);

      // 其余代码保持不变
      if (fields.length === 0) {
        console.log("没有需要更新的字段");
        return { success: true };
      }

      const query = `UPDATE documents SET ${fields.join(", ")} WHERE id = ?`;
      params.push(parseInt(id));

      console.log(`执行SQL: ${query}, 参数:`, params);
      await this.runQuery(query, params);
      console.log(`公文更新成功: ID=${id}`);
      return { success: true };
    } catch (error) {
      console.error("更新公文失败:", error);
      return { success: false, error: error.message };
    }
  }

  // 删除公文方法
  async deleteDocument(id) {
    // 先删除相关的协办信息
    await this.runQuery(
      "DELETE FROM document_assistants WHERE document_id = ?",
      [parseInt(id)]
    );
    // 再删除公文
    await this.runQuery("DELETE FROM documents WHERE id = ?", [parseInt(id)]);
  }

  // 初始化默认数据
  async initDefaultData() {
    const defaultOrgs = [
      {
        name: "测试组织一",
        parent_id: null,
        status: "active",
        create_time: "2023-01-15 09:30:00",
        // 已删除：description字段
      },
    ];

    for (const org of defaultOrgs) {
      await this.runQuery(
        "INSERT INTO organizations (name, parent_id, status, create_time) VALUES (?, ?, ?, ?)",
        [org.name, org.parent_id, org.status, org.create_time]
      );
      // 已删除：org.description参数
    }

    console.log("已初始化默认组织数据");
  }

  // 执行查询（返回多行数据）
  async getAll(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // 执行查询（返回单行数据）
  async getOne(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(query, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // 执行更新/插入/删除操作
  async runQuery(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(query, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }

  // 获取组织列表（包含父组织名称）
  async getOrganizations() {
    const query = `
      SELECT 
        o1.id, 
        o1.name, 
        o1.parent_id, 
        o2.name as parent_name, 
        o1.status, 
        o1.create_time 
      FROM organizations o1
      LEFT JOIN organizations o2 ON o1.parent_id = o2.id
      ORDER BY o1.id
    `;
    // 已删除：o1.description字段
    const orgs = await this.getAll(query);

    // 格式化数据以匹配前端需求
    return orgs.map((org) => ({
      id: org.id.toString(),
      name: org.name,
      parentId: org.parent_id ? org.parent_id.toString() : "",
      parentName: org.parent_name || "无",
      status: org.status,
      createTime: org.create_time,
      // 已删除：description字段
    }));
  }

  // 添加组织
  async addOrganization(orgData) {
    const result = await this.runQuery(
      "INSERT INTO organizations (name, parent_id, status, create_time) VALUES (?, ?, ?, ?)",
      [
        orgData.name,
        orgData.parentId ? parseInt(orgData.parentId) : null,
        orgData.status,
        orgData.createTime,
        // 已删除：orgData.description参数
      ]
    );
    return result.lastID;
  }

  // 更新组织
  async updateOrganization(id, orgData) {
    await this.runQuery(
      "UPDATE organizations SET name = ?, parent_id = ?, status = ? WHERE id = ?",
      [
        orgData.name,
        orgData.parentId ? parseInt(orgData.parentId) : null,
        orgData.status,
        parseInt(id),
        // 已删除：orgData.description参数
      ]
    );
  }

  // 删除组织
  async deleteOrganization(id) {
    await this.runQuery("DELETE FROM organizations WHERE id = ?", [
      parseInt(id),
    ]);
  }

  // 关闭数据库连接
  close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            reject(err);
          } else {
            console.log("数据库连接已关闭");
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  // 获取员工列表（包含组织信息）
  async getEmployees() {
    const query = `
      SELECT 
        e.id, 
        e.name, 
        e.phone, 
        e.enable_date, 
        e.status, 
        e.organization_id, 
        o.name as organization_name, 
        e.create_time 
      FROM employees e
      LEFT JOIN organizations o ON e.organization_id = o.id
      ORDER BY e.id
    `;
    const employees = await this.getAll(query);

    // 格式化数据以匹配前端需求
    return employees.map((emp) => ({
      id: emp.id.toString(),
      name: emp.name,
      phone: emp.phone,
      enableDate: emp.enable_date,
      status: emp.status,
      organizationId: emp.organization_id.toString(),
      organizationName: emp.organization_name,
      createTime: emp.create_time,
    }));
  }
  // 添加员工
  async addEmployee(empData) {
    const result = await this.runQuery(
      "INSERT INTO employees (name, phone, enable_date, status, organization_id, create_time) VALUES (?, ?, ?, ?, ?, ?)",
      [
        empData.name,
        empData.phone,
        empData.enableDate,
        empData.status,
        parseInt(empData.organizationId),
        empData.createTime,
      ]
    );
    return result.lastID;
  }

  // 更新员工
  async updateEmployee(id, empData) {
    await this.runQuery(
      "UPDATE employees SET name = ?, phone = ?, enable_date = ?, status = ?, organization_id = ? WHERE id = ?",
      [
        empData.name,
        empData.phone,
        empData.enableDate,
        empData.status,
        parseInt(empData.organizationId),
        parseInt(id),
      ]
    );
  }

  // 删除员工
  async deleteEmployee(id) {
    await this.runQuery("DELETE FROM employees WHERE id = ?", [parseInt(id)]);
  }

  // 获取统计摘要（总公文量、总机构数、总人员数）
  async getStatisticsSummary() {
    try {
      const [documentsCount, organizationsCount, employeesCount] =
        await Promise.all([
          this.getOne(`SELECT COUNT(*) as count FROM documents`),
          this.getOne(
            `SELECT COUNT(*) as count FROM organizations WHERE status = 'active'`
          ),
          this.getOne(
            `SELECT COUNT(*) as count FROM employees WHERE status = 'active'`
          ),
        ]);

      return {
        totalDocuments: documentsCount.count,
        totalOrgs: organizationsCount.count,
        totalPersons: employeesCount.count,
      };
    } catch (error) {
      console.error("获取统计摘要失败:", error);
      // 返回默认数据以避免页面显示错误
      return {
        totalDocuments: 0,
        totalOrgs: 0,
        totalPersons: 0,
      };
    }
  }
  // 获取每日公文统计数据
  async getDailyDocumentStats(startDate, endDate) {
    try {
      const query = `
        SELECT 
          substr(receive_date, 1, 10) as date,
          COUNT(*) as count 
        FROM documents 
        WHERE receive_date BETWEEN ? AND ?
        GROUP BY substr(receive_date, 1, 10)
        ORDER BY date
      `;

      const results = await this.getAll(query, [startDate, endDate]);

      // 如果没有数据，返回空数组
      if (!results || results.length === 0) {
        return [];
      }

      return results;
    } catch (error) {
      console.error("获取每日公文统计失败:", error);
      return [];
    }
  }

  // 获取各组织公文统计数据
  async getOrgDocumentStats(startDate, endDate) {
    try {
      const query = `
        SELECT 
          o.name,
          COUNT(d.id) as count 
        FROM documents d
        LEFT JOIN organizations o ON d.承办单位_id = o.id
        WHERE d.receive_date BETWEEN ? AND ?
        GROUP BY o.name
        ORDER BY count DESC
      `;

      const results = await this.getAll(query, [startDate, endDate]);

      // 如果没有数据，返回空数组
      if (!results || results.length === 0) {
        return [];
      }

      return results;
    } catch (error) {
      console.error("获取组织公文统计失败:", error);
      return [];
    }
  }
  // 备份数据库到指定路径
  async backupDatabase(backupPath) {
    try {
      // 关闭数据库连接以确保所有数据都已写入磁盘
      await this.close();

      // 复制数据库文件到备份路径
      fs.copyFileSync(dbPath, backupPath);

      // 重新打开数据库连接
      await this.init();

      console.log(`数据库已成功备份到: ${backupPath}`);
      return true;
    } catch (error) {
      console.error("数据库备份失败:", error);
      // 尝试重新打开数据库连接
      try {
        await this.init();
      } catch (reopenError) {
        console.error("备份后重新打开数据库失败:", reopenError);
      }
      throw error;
    }
  }

  // 从备份文件恢复数据库
  async restoreDatabase(backupPath) {
    try {
      // 检查备份文件是否存在
      if (!fs.existsSync(backupPath)) {
        throw new Error("备份文件不存在");
      }

      // 关闭数据库连接
      await this.close();

      // 复制备份文件到数据库路径
      fs.copyFileSync(backupPath, dbPath);

      // 重新打开数据库连接
      await this.init();

      console.log(`数据库已成功从备份恢复: ${backupPath}`);
      return true;
    } catch (error) {
      console.error("数据库恢复失败:", error);
      // 尝试重新打开数据库连接
      try {
        await this.init();
      } catch (reopenError) {
        console.error("恢复后重新打开数据库失败:", reopenError);
      }
      throw error;
    }
  }
}

module.exports = new Database();
