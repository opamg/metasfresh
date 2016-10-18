package de.metas.dlm.partitioner.config;

import org.adempiere.util.Check;

import de.metas.dlm.partitioner.config.PartitionerConfigLine.LineBuilder;

/*
 * #%L
 * metasfresh-dlm
 * %%
 * Copyright (C) 2016 metas GmbH
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

/**
 * Each instance of this class belongs to one {@link PartitionerConfigLine} (parent) and specifies one column of its parent's {@link PartitionerConfigLine#getTableName()}.
 * <p>
 * E.g. if the parent's table name is <code>C_Invoice</code>, then this instance might be about
 * <li>{@link #getReferencingColumnName()} <code>=_C_Order_ID</code></li>
 * <li>{@link #getReferencedTableName()} <code>=C_Order</code></li>
 * Meaning that this instance, together with its parents tells the engine that <code>C_Invoice</code> records can reference <code>C_Order</code> records via the foreign key column <code>C_Invoice.C_Order_ID</code>.
 *
 * Further, if {@link #getReferencedConfigLine()} is not <code>null</code>, it means that <code>C_Order</code> is also a DLM'ed table and might have its own list of config references.
 *
 * @author metas-dev <dev@metasfresh.com>
 *
 */
public class PartionConfigReference
{
	private final String referencedTableName;
	private final String referencingColumnName;
	private final PartitionerConfigLine referencedConfigLine;
	private final PartitionerConfigLine parent;

	private PartionConfigReference(PartitionerConfigLine parent,
			String referencingColumnName,
			String referencedTableName,
			PartitionerConfigLine referencedConfigLine)
	{
		this.parent = parent;
		this.referencingColumnName = referencingColumnName;
		this.referencedTableName = referencedTableName;
		this.referencedConfigLine = referencedConfigLine;
	}

	public String getReferencedTableName()
	{
		return referencedTableName;
	}

	public String getReferencingColumnName()
	{
		return referencingColumnName;
	}

	public PartitionerConfigLine getReferencedConfigLine()
	{
		return referencedConfigLine;
	}

	public PartitionerConfigLine getParent()
	{
		return parent;
	}

	@Override
	public String toString()
	{
		return "PartionConfigReference [parent=" + parent + ", referencingColumnName=" + referencingColumnName + ", referencedTableName=" + referencedTableName + ", referencedConfigLine=" + referencedConfigLine + "]";
	}

	public static class RefBuilder
	{
		private String referencedTableName;
		private String referencingColumnName;

		private String referencedConfigLineTableName;

		private final PartitionerConfigLine.LineBuilder parentbuilder;

		RefBuilder(PartitionerConfigLine.LineBuilder parentBuilder)
		{
			this.parentbuilder = parentBuilder;
		}

		public RefBuilder setReferencedTableName(String referencedTableName)
		{
			this.referencedTableName = referencedTableName;
			return this;
		}

		public RefBuilder setReferencingColumnName(String referencingColumnName)
		{
			this.referencingColumnName = referencingColumnName;
			return this;
		}

		/**
		 * Set the table name of the {@link PartitionerConfigLine} that the ref build by this instance shall reference.
		 *
		 * @param referencedConfigLineTableName
		 * @return
		 */
		public RefBuilder setReferencedConfigLine(String referencedConfigLineTableName)
		{
			this.referencedConfigLineTableName = referencedConfigLineTableName;
			return this;
		}

		public LineBuilder endRef()
		{
			return parentbuilder;
		}

		/**
		 * Convenience method to end the current ref builder and start a new one.
		 *
		 * @return the new reference builder, <b>not</b> this instance.
		 */
		public RefBuilder newRef()
		{
			return endRef().newRef();
		}

		/**
		 * Supposed to be called only by the parent builder.
		 *
		 * @param parent
		 * @return
		 */
		/* package */ PartionConfigReference build(PartitionerConfigLine parent)
		{
			final PartitionerConfigLine referencedConfigLine;
			if (Check.isEmpty(referencedConfigLineTableName, true))
			{
				referencedConfigLine = null;
			}
			else
			{
				referencedConfigLine = parent.getParent().getLine(referencedConfigLineTableName);
			}

			return new PartionConfigReference(parent, referencingColumnName, referencedTableName, referencedConfigLine);
		}

	}
}
