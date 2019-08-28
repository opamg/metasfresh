/*
 * #%L
 * metasfresh-e2e
 * %%
 * Copyright (C) 2019 metas GmbH
 * %%
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as
 * published by the Free Software Foundation, either version 2 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public
 * License along with this program. If not, see
 * <http://www.gnu.org/licenses/gpl-2.0.html>.
 * #L%
 */

import { Product, ProductCategory } from '../../support/utils/product';
import { appendHumanReadableNow } from '../../support/utils/utils';
import { BillOfMaterial, BillOfMaterialLine } from '../../support/utils/billOfMaterial';
import { Builder } from '../../support/utils/builder';
import { ColumnAndValue } from '../../support/commands/navigation';
import { RewriteURL } from '../../support/utils/constants';
import { applyFilters, selectNotFrequentFilterWidget, toggleNotFrequentFilters } from '../../support/functions';

let date = null;
// date = '28T09_52_21_149';

// testdata
let categoryName1 = appendHumanReadableNow('Category1', date);
let categoryName2 = appendHumanReadableNow('Category2', date);
let productComponentName1 = appendHumanReadableNow('Product Component 1', date);
let productComponentName2 = appendHumanReadableNow('Product Component 2', date);
let productComponentName3 = appendHumanReadableNow('Product Component 3', date);
let productComponentQty1 = 25;
let productComponentQty2 = 20;
let productComponentQty3 = 50;
let finishedProductName = appendHumanReadableNow('Finished Product', date);
const bomIssueMethod = 'Issue only for what was received';

// HU
let huQty = 100;
const locatorId = 'Hauptlager_StdWarehouse_Hauptlager_0_0_0';

// manufacturing order
let manufacturingResource = 'test';
let manufacturingWorkflow = 'test';
let stdWarehouse = 'Hauptlager_StdWarehouse';
const expectedManufacturingPriorityRule = 'Medium';
const manufacturingQtyEntered = '1';
const eachUOM = 'Each';
const manufacturingDateOrdered = '08/22/2019 10:00 A';
const manufacturingDatePromised = '08/23/2019 10:00 A';

// static
const expectedManufacturingTargetDocType = 'Produktionsauftrag';
const packingStatusActive = 'Active';
const packingStatusDestroyed = 'Destroyed';
const packingStatusPlanning = 'Planning';
const packingStatusIssued = 'Issued';
const expectNoPackingItem = 'No Packing Item';

// columns
const manufacturingOrderComponentsProductColumn = 'M_Product_ID';
const productColumn = 'product';
const typeColumn = 'type';
const qtyPlanColumn = 'qtyPlan';
const qtyColumn = 'qty';
const pickingCodeColumn = 'code';
const pickingStatusColumn = 'huStatus';
const huSelectionCodeColumn = 'Value';
const qtyCuColumn = 'QtyCU';

// test
let huValue1;
let huValue2;
let huValue3;

// describe('adletethis', function() {
//   it('adletethis', () => {
//     cy.visitWindow('53009', '1000004');
//     huValue1 = '1000053';
//     huValue2 = '1000054';
//     huValue3 = '1000055';
//
//     cy.selectTab('Window-53009-AD_Tab-53039');
//     cy.expectNumberOfRows(3);
//     cy.selectRowByColumnAndValue({ column: manufacturingOrderComponentsProductColumn, value: productComponentName1 });
//     cy.selectRowByColumnAndValue({ column: manufacturingOrderComponentsProductColumn, value: productComponentName2 });
//     cy.selectRowByColumnAndValue({ column: manufacturingOrderComponentsProductColumn, value: productComponentName3 });
//   });
// });

describe('Create test data', function() {
  it('Create product component 1', function() {
    cy.fixture('product/simple_productCategory.json').then(productCategoryJson => {
      Object.assign(new ProductCategory(), productCategoryJson)
        .setName(categoryName1)
        .apply();
    });

    cy.fixture('product/simple_product.json').then(productJson => {
      Object.assign(new Product(), productJson)
        .setName(productComponentName1)
        .setProductCategory(categoryName1)
        .apply();
    });
  });

  it('Create product component 2', function() {
    cy.fixture('product/simple_productCategory.json').then(productCategoryJson => {
      Object.assign(new ProductCategory(), productCategoryJson)
        .setName(categoryName2)
        .apply();
    });

    cy.fixture('product/simple_product.json').then(productJson => {
      Object.assign(new Product(), productJson)
        .setName(productComponentName2)
        .setProductCategory(categoryName2)
        .apply();
    });
  });

  it('Create product component 3', function() {
    cy.fixture('product/simple_product.json').then(productJson => {
      Object.assign(new Product(), productJson)
        .setName(productComponentName3)
        .setProductCategory(categoryName2)
        .apply();
    });
  });

  it('Create finished product', function() {
    cy.fixture('product/simple_product.json').then(productJson => {
      Object.assign(new Product(), productJson)
        .setName(finishedProductName)
        .setProductCategory(categoryName1)
        .apply();
    });
  });

  it('Create a BOM for the product', function() {
    cy.fixture('product/bill_of_material.json').then(billMaterialJson => {
      Object.assign(new BillOfMaterial(), billMaterialJson)
        .setProduct(finishedProductName)
        .setIsVerified(true)
        // eslint-disable-next-line
        .addLine(new BillOfMaterialLine().setProduct(productComponentName1).setQuantity(productComponentQty1).setIssueMethod(bomIssueMethod))
        // eslint-disable-next-line
        .addLine(new BillOfMaterialLine().setProduct(productComponentName2).setQuantity(productComponentQty2).setIssueMethod(bomIssueMethod))
        // eslint-disable-next-line
        .addLine(new BillOfMaterialLine().setProduct(productComponentName3).setQuantity(productComponentQty3).setIssueMethod(bomIssueMethod))
        .apply();
    });
  });

  it('Create 3 HUs', function() {
    Builder.createHUWithStock(productComponentName1, huQty, locatorId).then(huVal => (huValue1 = huVal));
    Builder.createHUWithStock(productComponentName2, huQty, locatorId).then(huVal => (huValue2 = huVal));
    Builder.createHUWithStock(productComponentName3, huQty, locatorId).then(huVal => (huValue3 = huVal));
  });
});

describe('Create Manufacturing Order', function() {
  it('Create Manufacturing Order Doc', function() {
    cy.visitWindow('53009', 'NEW');

    cy.writeIntoLookupListField('M_Product_ID', finishedProductName, finishedProductName);
    cy.getStringFieldValue('PP_Product_BOM_ID').should('contain', finishedProductName);
    cy.selectInListField('S_Resource_ID', manufacturingResource);
    cy.writeIntoLookupListField('AD_Workflow_ID', manufacturingWorkflow, manufacturingWorkflow);

    cy.getStringFieldValue('C_DocTypeTarget_ID').should('contain', expectedManufacturingTargetDocType);
    cy.getStringFieldValue('PriorityRule').should('contain', expectedManufacturingPriorityRule);
    cy.getStringFieldValue('QtyEntered').should('contain', manufacturingQtyEntered);
    cy.getStringFieldValue('C_UOM_ID').should('contain', eachUOM);

    cy.writeIntoStringField('DateOrdered', manufacturingDateOrdered, false, null, true);
    cy.writeIntoStringField('DatePromised', manufacturingDatePromised, false, null, true);
    cy.selectInListField('M_Warehouse_ID', stdWarehouse);

    // expect 3 lines in tab, 1 for each product inside the bom
    cy.selectTab('Window-53009-AD_Tab-53039');
    cy.expectNumberOfRows(3);
    cy.selectRowByColumnAndValue({ column: manufacturingOrderComponentsProductColumn, value: productComponentName1 });
    cy.selectRowByColumnAndValue({ column: manufacturingOrderComponentsProductColumn, value: productComponentName2 });
    cy.selectRowByColumnAndValue({ column: manufacturingOrderComponentsProductColumn, value: productComponentName3 });

    cy.completeDocument();
  });
});

describe('Test', function() {
  it('Run action "Issue/Receipt" and expect 4 rows', function() {
    cy.executeHeaderAction('WEBUI_PP_Order_IssueReceipt_Launcher');
  });

  it('Checks, move to previous it', function() {
    cy.expectNumberOfRows(4, true);

    cy.selectRowByColumnAndValue(createColumnAndValue(finishedProductName, undefined, 'MP', manufacturingQtyEntered), true);
    // eslint-disable-next-line
    cy.selectRowByColumnAndValue(createColumnAndValue(productComponentName1, undefined, 'CO', productComponentQty1), true);
    // eslint-disable-next-line
    cy.selectRowByColumnAndValue(createColumnAndValue(productComponentName2, undefined, 'CO', productComponentQty2), true);
    // eslint-disable-next-line
    cy.selectRowByColumnAndValue(createColumnAndValue(productComponentName3, undefined, 'CO', productComponentQty3), true);
  });

  it('Select first HU as source', function() {
    selectHuAsSource(productComponentName1, huValue1);
  });
  it('Select second HU as source', function() {
    selectHuAsSource(productComponentName2, huValue2);
  });
  it('Select third HU as source', function() {
    selectHuAsSource(productComponentName3, huValue3);
  });

  it('Receive the finished product', function() {
    cy.selectRowByColumnAndValue({ column: productColumn, value: finishedProductName }, true);
    cy.executeQuickAction('WEBUI_PP_Order_Receipt', true);
    cy.getStringFieldValue('M_HU_PI_Item_Product_ID').should('contain', expectNoPackingItem);
    cy.writeIntoStringField('QtyCU', manufacturingQtyEntered, true);
    cy.pressStartButton();
    cy.selectRowByColumnAndValue(createColumnAndValue(finishedProductName, undefined, 'CU', null, manufacturingQtyEntered, packingStatusPlanning), true);
  });

  it('Run action "Issue CUs from source HUs" when only component 1 is selected', function() {
    cy.selectRowByColumnAndValue(createColumnAndValue(productComponentName1, null, 'CO'), true);
    cy.executeQuickAction('WEBUI_PP_Order_M_Source_HU_IssueCUQty', true);
    cy.getStringFieldValue('QtyCU').should('equals', productComponentQty1.toString(10));
    cy.pressStartButton();
    cy.selectRowByColumnAndValue(createColumnAndValue(productComponentName1, undefined, 'CU', null, productComponentQty1, packingStatusIssued), true);
    cy.selectRowByColumnAndValue(createColumnAndValue(productComponentName1, undefined, 'CU', null, huQty - productComponentQty1, packingStatusActive), true);
  });

  it('Run action "Issue CUs from source HUs" when both component 2 and 3 are selected', function() {
    // multiple selection by pressing shift and clicking
    cy.selectRowByColumnAndValue(createColumnAndValue(productComponentName2, null, 'CO'), true)
      .get('body')
      .type('{shift}', { release: false })
      .selectRowByColumnAndValue(createColumnAndValue(productComponentName3, null, 'CO'), true)
      .get('body')
      .type('{shift}');

    cy.executeQuickAction('WEBUI_PP_Order_M_Source_HU_IssueCUQty', true);
    // i have the feeling this 500ms sleep may in certain cases not be enough, however currently i have no idea how "not to need" it.
    // note in case you want to wait for a `RewriteURL.DocumentLayout`: that's not gonna work, i have already tried that.
    // there are some cases where a new layout is not needed, even though something new appears onscreen. ¯\_(ツ)_/¯
    cy.pressStartButton(500);

    cy.selectRowByColumnAndValue(createColumnAndValue(productComponentName2, undefined, 'CU', null, productComponentQty2, packingStatusIssued), true);
    cy.selectRowByColumnAndValue(createColumnAndValue(productComponentName2, undefined, 'CU', null, huQty - productComponentQty2, packingStatusActive), true);

    cy.selectRowByColumnAndValue(createColumnAndValue(productComponentName3, undefined, 'CU', null, productComponentQty3, packingStatusIssued), true);
    cy.selectRowByColumnAndValue(createColumnAndValue(productComponentName3, undefined, 'CU', null, huQty - productComponentQty3, packingStatusActive), true);
  });

  it('Process the finished product', function() {
    cy.selectRowByColumnAndValue(createColumnAndValue(finishedProductName, undefined, 'MP'), true);
    cy.executeQuickAction('WEBUI_PP_Order_ChangePlanningStatus_Complete', true, false);

    cy.selectRowByColumnAndValue(createColumnAndValue(finishedProductName, undefined, 'CU', null, manufacturingQtyEntered, packingStatusActive), true);
    cy.selectRowByColumnAndValue(createColumnAndValue(productComponentName1, undefined, 'CU', null, productComponentQty1, packingStatusDestroyed), true);
    cy.selectRowByColumnAndValue(createColumnAndValue(productComponentName2, undefined, 'CU', null, productComponentQty2, packingStatusDestroyed), true);
    cy.selectRowByColumnAndValue(createColumnAndValue(productComponentName3, undefined, 'CU', null, productComponentQty3, packingStatusDestroyed), true);
  });

  it('Go to Handling Unit Editor and expect 1 qty of finished product', function() {
    cy.visitWindow('540189');
    toggleNotFrequentFilters();
    selectNotFrequentFilterWidget('default');
    cy.writeIntoLookupListField('M_Product_ID', finishedProductName, finishedProductName, false, false, null, true);
    applyFilters();

    cy.expectNumberOfRows(1);
    cy.selectRowByColumnAndValue({ column: qtyCuColumn, value: manufacturingQtyEntered });
  });
});

function selectHuAsSource(productValue, huValue) {
  cy.selectRowByColumnAndValue({ column: productColumn, value: productValue }, true);
  cy.log('after row selection');
  cy.aa('WEBUI_PP_Order_HUEditor_Launcher');
  cy.selectRightTable().within(() => {
    cy.selectRowByColumnAndValue({ column: huSelectionCodeColumn, value: huValue }, false, true);
  });
  cy.executeQuickAction('WEBUI_PP_Order_HUEditor_Create_M_Source_HUs', true, false);
  cy.selectLeftTable().within(() => {
    // eslint-disable-next-line
    cy.selectRowByColumnAndValue(createColumnAndValue(productValue, huValue, 'CU', null, huQty, packingStatusActive), false, true);
  });
  // used to close the right table
  cy.get('.panel-modal-header-title').click();
}

function createColumnAndValue(productValue, codeValue, typeValue, qtyPlanValue, qtyValue, packingStatusValue) {
  // eslint-disable-next-line
  const colAndVal = [
    new ColumnAndValue(productColumn, productValue),
    new ColumnAndValue(typeColumn, typeValue),
  ];
  if (qtyPlanValue) {
    colAndVal.push(new ColumnAndValue(qtyPlanColumn, qtyPlanValue));
  }
  if (qtyValue) {
    colAndVal.push(new ColumnAndValue(qtyColumn, qtyValue));
  }
  if (packingStatusValue) {
    colAndVal.push(new ColumnAndValue(pickingStatusColumn, packingStatusValue));
  }
  if (codeValue) {
    colAndVal.push(new ColumnAndValue(pickingCodeColumn, codeValue));
  }
  return colAndVal;
}
