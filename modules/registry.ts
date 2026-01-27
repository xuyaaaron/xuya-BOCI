/**
 * 模块注册中心
 * 管理所有数据模块的注册和访问
 */

import { ModuleConfig } from './types';
import { BOCIASI_MODULE } from './bociasi.config';
import { WIND_2X_MODULE } from './wind2x.config';

/**
 * 模块注册表
 * 新增模块时，在这里注册即可
 */
const MODULE_REGISTRY: Record<string, ModuleConfig> = {
    bociasi: BOCIASI_MODULE,
    wind_2x_erp: WIND_2X_MODULE,
    // 未来添加新模块时，在这里注册
    // example_module: EXAMPLE_MODULE,
};

/**
 * 模块注册中心类
 */
export class ModuleRegistry {
    private modules: Record<string, ModuleConfig>;

    constructor() {
        this.modules = MODULE_REGISTRY;
    }

    /**
     * 获取所有模块
     */
    getAllModules(): ModuleConfig[] {
        return Object.values(this.modules);
    }

    /**
     * 根据ID获取模块
     */
    getModule(moduleId: string): ModuleConfig | undefined {
        return this.modules[moduleId];
    }

    /**
     * 检查模块是否存在
     */
    hasModule(moduleId: string): boolean {
        return moduleId in this.modules;
    }

    /**
     * 获取模块数量
     */
    getModuleCount(): number {
        return Object.keys(this.modules).length;
    }

    /**
     * 注册新模块（用于动态扩展）
     */
    registerModule(moduleConfig: ModuleConfig): void {
        if (this.hasModule(moduleConfig.id)) {
            console.warn(`模块 ${moduleConfig.id} 已存在，将被覆盖`);
        }
        this.modules[moduleConfig.id] = moduleConfig;
    }
}

// 全局模块注册中心实例
export const moduleRegistry = new ModuleRegistry();

// 导出常量配置
export { BOCIASI_MODULE, WIND_2X_MODULE };
export type { ModuleConfig };
